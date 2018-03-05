var express = require('express'),
	search = express.Router(),
	path = require('path'),
	deferred = require('deferred'),
	promisify = deferred.promisify,
	natural = require('natural'),
	adiff = require('adiff'),
	request = require('request'),
	_ = require('lodash'),
	db = require('../db'),
	api = {
		vkontakte: require('../indexer/vk/api.js'),
		facebook: require('../indexer/facebook/api.js'),
		twitter: require('../indexer/twitter/api.js')
	},
	xml2json = require('xml2json'),
	mongoose = db.mongoose,
	Twitter = require('node-twitter'),
	classifier = require('../classifier').classifier,
	lang = require('../classifier').lang,
	wikipedia = require("wikipedia-js"),
	moment = require('moment'),
	log = require('../lib').log.getLogger(),
	ObjectID = require('mongodb').ObjectID;

var MongoClient = require('mongodb').MongoClient,
		assert = require('assert');

moment.locale('ru');

// models
var Group = db.models.Group,
	Post = db.models.Post,
	User = db.models.User;

var RailsGroup = db.models.RailsGroup,
	RailsVariable = db.models.RailsVariable;

// promisify
Group.pFind = promisify(Group.find);
Post.pFind = promisify(Post.find);

var pWikiSearch = promisify(wikipedia.searchArticle);

var save = function(doc){
	var d = deferred();
	doc.save(function(err){
		d.resolve(doc);
	});
	return d.promise;
};

var find_post = function(){
	var d = deferred();
	Post.findOne(arguments[0]).exec(function(err, post){
		if (!err && post)
			d.resolve(post);
		else
			d.resolve([]);
	});
	return d.promise;
};

var find_posts = function(){
	var d = deferred();
	Post.find(arguments).exec(function(err, posts){
		if (!err && posts)
			d.resolve(posts);
		else
			d.resolve([]);
	});
	return d.promise;
};

var find_groups = function(){
	var d = deferred();
	Group.find(arguments).populate('posts').cache().exec(function(err, groups){
		if (!err && groups)
			d.resolve(groups);
		else
			d.resolve([]);
	})
	return d.promise();
};

var db_wait_until = function(){
	var d = deferred();
	arguments[0].once(arguments[1], function(err){
		if (!err)
			d.resolve(true);
		else{
			d.reject(false);
		}
	});
	return d.promise;
};

var count_occurrences = function(string, subString, allowOverlapping){
  string+="";
  subString+="";
  if(subString.length <= 0)
  	return string.length+1;
  var n = 0,
  	pos = 0;
  var step = allowOverlapping?1:subString.length;

  while (true){
      pos = string.indexOf(subString, pos);
      if (pos >= 0){
    		n++;
    		pos += step;
    	} else
    		break;
  }
  return n;
};

// var prepareClassifier = function(){
// 	var d = deferred();
// 	var c = classifier('classifier.json')
// 	.then(function(c){
// 		var trainPath = path.resolve('classifier', 'train');
// 		c.train.dir(trainPath)
// 		.then(function(){
// 			c.save(path.join('classifier', 'classifier.json'))
// 			.then(function(){
// 				d.resolve(c);
// 			});
// 		});
// 	});
// 	return d.promise;
// };

var sequence_length = function(str1_arr, str2){
	var str2_arr = str2.split(' ');
	// var count = 0;
	// var si = str2_arr.indexOf(str1_arr[0]);
	// if (si !== -1){
	// 	// console.log(str1_arr);
	// 	// console.log(str2_arr);
	// 	for (var i = si; i < str1_arr.length; i++)
	// 		if (str2_arr[i].indexOf(str1_arr[i - si + 1]) !== -1)
	// 			count++;
	// 		else
	// 			break;
	// }
	// else
	// 	count = 0;
	// if (count > 1){
	// 	console.log(str1_arr);
	// 	console.log(str2_arr);
	// 	console.log(count);
	// }
	var ints = _.intersection(str1_arr, str2_arr);
	return ints.length;
};

var findPosts = function(category, query){
	query = query.toLowerCase();
	var postsWithKeywords = [],
		postsWithoutKeywords = [];
	var qWords = query.split(' ');
	return find_groups({ })
	.then(function(groups){
		return _
		.chain(groups)
		.map(function(group){
			return _
			.chain(group.posts)
			.map(function(post){
				post.text = post.text.toLowerCase();
				return { post: post, occurrences: adiff.lcs(qWords, post.text.split(' ')).length, group: group};
			})
			.filter(function(e){
				return e.occurrences > 0;
			})
			.value();
		})
		.flatten()
		.groupBy(function(e){
			return e.occurrences;
		})
		.sortBy(function(e){
			return -e[0].occurrences;
		})
		.flatten()
		.value()
		.slice(0, 20);
	});
};

var queryAPI = {
	wikipedia: function(req, query){
		var d = deferred();
		var url = 'http://ru.wikipedia.org/w/api.php?action=opensearch&search=' + query + '&format=xml';
		request(url, function(err, resp, body){
			if (!err){
       try{
        var json = xml2json.toJson(body, {object: true});
        d.resolve(json);
       }
       catch(e){
        d.resolve({error: e});
       }

			} else
				d.reject(err);
		});
		return d.promise;
	},
	facebook: function(req, query){
		if (!req.session.oauth || !req.session.oauth.facebook)
			return deferred(false);

		var access_token = req.session.oauth.facebook.access_token;

		return api.facebook.executeMethod('search', {q: query, limit: 3, type: 'group', access_token: access_token})
		.then(function(response){
			if (response.error)
				return response;

			var group_ids = _.pluck(response.data, 'id');
			return deferred.map(group_ids, function(group_id){
				return api.facebook.executeMethod(group_id, {access_token: access_token})
				.then(function(group){
					return group;
				});
			});
		});

	},
	vkontakte: function(req, query){
		if (!req.session.oauth || !req.session.oauth.vkontakte)
			return deferred(false);

		var access_token = req.session.oauth.vkontakte.access_token;

		var options = {
			method: 'groups.search',
			params: {
				q: query,
				count: 3,
				sort: 0,
				access_token: access_token,
				v: 5.24
			}
		};

		return api.vkontakte.executeMethod(options)
		.then(function(response){
			if (response.error)
				return {error: true};

			if (response.response.items){
				var group_ids = _
				.reduce(response.response.items, function(arr, next){
					arr.push(next.screen_name);
					return arr;
				}, []);

				var options = {
					method: 'groups.getById',
					params: {
						group_ids: group_ids.join(','),
						fields: 'members_count'
					}
				};

				return api.vkontakte.executeMethod(options)
				.then(function(response){
					if (response.response){
						return deferred(response.response);
					} else
						return deferred(false);
				});
			}
		});
	},
	twitter: {
		users: function(req, query){
			if (!req.session.oauth || !req.session.oauth.twitter)
				return deferred(false);
			var twitterClient = new Twitter.RestClient(
				'wNGG0uPLsEvAMtPoRt2lIKogc',
				'n2u0aNF6I1mG6GdTKGmFW3ZFZUPKAUBUH0ViIMSaRLAR7Uty4Z',
				req.session.oauth.twitter.token,
				req.session.oauth.twitter.token_secret
			);
			twitterClient.pUsersSearch = promisify(twitterClient.usersSearch);
			return twitterClient.pUsersSearch({
				q: encodeURIComponent(query),
				page: 1,
				count: 3
			})
			.then(function(users){
				return users;
			});
		},
		tweets: function(req, query){
			if (!req.session.oauth || !req.session.oauth.twitter)
				return deferred(false);
			var twitterClient = new Twitter.RestClient(
				'wNGG0uPLsEvAMtPoRt2lIKogc',
				'n2u0aNF6I1mG6GdTKGmFW3ZFZUPKAUBUH0ViIMSaRLAR7Uty4Z',
				req.session.oauth.twitter.token,
				req.session.oauth.twitter.token_secret
			);
			twitterClient.pSearchTweets = promisify(twitterClient.searchTweets);
			return twitterClient.pSearchTweets({
				q: encodeURIComponent(query),
				result_type: 'popular'
			})
			.then(function(tweets){
				return tweets;
			})
			.catch(function(err){
				log.error(err);
			});
		}
	}
};

db.connections.on('open')
.then(function(){
	MongoClient.connect('mongodb://localhost:27017/runexto_node_development', function(err, mc){
		// log.error(mc);

		search.get('/search', function(req, res, next){
			res.redirect('/');
		});

		search.get('/reindex/:id', function(req, res, next){
			find_post({id: parseInt(req.params.id.toString())})
			.then(function(post){
				var options = {
					method: 'wall.getById',
					params: {
						posts: post.from_id.toString() + '_' + post.id.toString(),
						v: 5.24
					}
				};

				return api.vkontakte.executeMethod(options)
				.then(function(resp){
					post.likes = resp.response[0].likes.count;
					post.reposts = resp.response[0].reposts.count;
					return save(post)
					.then(function(post){
						res.set('Content-Type', 'application/json');
						res.send(200, {likes: post.likes, reposts: post.reposts});
					});
				});
			});
		});

		search.get('/api/:params', function(req, res, next){
			var plain = req.params.params;
			var data = {};
			try {
				data = JSON.parse(decodeURIComponent(plain));
				data.params.access_token = req.session.auth.vkontakte.access_token;
				api.vkontakte.executeMethod(data)
				.then(function(data){
					res.set('Content-Type', 'application/json');
					res.send(data);
				})
				.catch(function(err){
					res.send(200, err);
				});
			} catch (e){
				res.send(200, { error: 'invalid params' });
			}
		});

		search.get('/refresh/:id', function(req, res, next){
			find_post({id : req.params.id })
			.then(function(post){
				// queryAPI.vkontakte
			});
		});

		classifier.init()
		.then(function(){
			console.log('classifier initialized');

			search.post('/api/search/:method', function(req, res, next){
				var body = req.body;

				var method = req.params.method,
					query = body.query || '';

				if (!req.session)
					res.status(404).end();
				else {
					switch(method){
						case 'groups':
							deferred(queryAPI.facebook(req, query), queryAPI.vkontakte(req, query), queryAPI.twitter.users(req, query), queryAPI.twitter.tweets(req, query), queryAPI.wikipedia(req, query))(function(response){
								var results = {};

								log.info('Query is', query);

								if (response[0])
									results.facebook = response[0];
								if (response[1])
									results.vkontakte = response[1];
								if (response[2])
									results.twitter = response[2];
								if (response[3])
									results.tweets = response[3];
								if (response[4] && response[4].SearchSuggestion)
									results.wiki = response[4].SearchSuggestion.Section.Item[0];

								res.send(results);
							});
							break;
						case 'comment':
							var data = req.body,
								msg = data.message,
								pid = data.post,
								gid = data.group;

							var options = {
								method: 'wall.addComment',
								params: {
									owner_id: gid,
									post_id: pid,
									text: _.escape(msg),
									access_token: req.session.oauth.vkontakte.access_token,
									v: 3.0
								}
							};

							api.vkontakte.executeMethod(options)
							.then(function(data){
								res.send(data);
							});
							break;
						case 'join':
							var data = req.body,
								pid = data.post,
								gid = data.group;

							var options = {
								method: 'groups.join',
								params: {
									group_id: gid,
									access_token: req.session.oauth.vkontakte.access_token,
									v: 3.0
								}
							};

							api.vkontakte.executeMethod(options)
							.then(function(data){
								res.send(data);
							});
							break;
						case 'repost':
							var data = req.body,
								pid = data.post,
								gid = data.group;

							var options = {
								method: 'wall.repost',
								params: {
									object: 'wall' + gid + '_' + pid,
									access_token: req.session.oauth.vkontakte.access_token,
									v: 3.0
								}
							};

							api.vkontakte.executeMethod(options)
							.then(function(data){
								res.send(data);
							});
							break;
						case 'like':
							var data = req.body,
								pid = data.post,
								gid = data.group;

							var options = {
								method: 'likes.add',
								params: {
									type: 'post',
									owner_id: gid,
									item_id: pid,
									access_token: req.session.oauth.vkontakte.access_token,
									v: 3.0
								}
							};

							api.vkontakte.executeMethod(options)
							.then(function(data){
								res.send(data);
							});
							break;
						case 'posts':
							switch (body.from){
								// con
								case 'groups':

									var authors = mc.collection('authors');
									var posts = mc.collection('posts');

									var authorsArray = [];

									log.debug('body is', body);


									posts.find({$text: {$search: query}, type: 0}, {score: {$meta: 'textScore'}}).sort( { score: { $meta: "textScore" }}).limit(10).sort( { likes: -1, reposts: -1 }).toArray(function(err, posts){

										posts = _.map(posts, function(post){
											var d = deferred();
											//setting pretty date
											post.date = moment(post.date).fromNow();
											//find authors of all posts
											if (authorsArray.indexOf(post.author.toString()) !== -1)
												post.author = authorsArray.indexOf(post.author.toString());
											else {
												authorsArray.push(post.author.toString());
												post.author = authorsArray.length - 1;
											}

											return post;
										});


										authorsArray = _.map(authorsArray, function(author){
											return new ObjectID(author);
										});

										log.debug(authorsArray);

										authors.find({_id: {$in: authorsArray}}).toArray(function(err, authors){
											_.forEach(authors, function(author){
												_.forEach(posts, function(post){
													if (author._id.toString() == authorsArray[post.author])
														post.author = author;
												});
											});
											res.json(posts);
										});
									});
								break;
								case 'people':

									var authors = mc.collection('authors');
									var posts = mc.collection('posts');

									var authorsArray = [];

									log.debug('body is', body);


									posts.find({$text: {$search: query}, type: 1}, {score: {$meta: 'textScore'}}).sort( { score: { $meta: "textScore" }}).limit(10).sort( { likes: -1, reposts: -1 }).toArray(function(err, posts){

										posts = _.map(posts, function(post){
											var d = deferred();
											//setting pretty date
											post.date = moment(post.date).fromNow();
											//find authors of all posts
											if (authorsArray.indexOf(post.author.toString()) !== -1)
												post.author = authorsArray.indexOf(post.author.toString());
											else {
												authorsArray.push(post.author.toString());
												post.author = authorsArray.length - 1;
											}

											return post;
										});


										authorsArray = _.map(authorsArray, function(author){
											return new ObjectID(author);
										});

										log.debug(authorsArray);

										authors.find({_id: {$in: authorsArray}, type: 1}).toArray(function(err, authors){
											_.forEach(authors, function(author){
												_.forEach(posts, function(post){
													if (author._id.toString() == authorsArray[post.author])
														post.author = author;
												});
											});
											res.json(posts);
										});
									});
								break;
								default:
								return;
							}

							break;
						case 'preview':
							var data = req.body,
								src = data.source,
								pid = data.post,
								gid = data.group,
								query = data.query;


							log.debug(data);

							switch (src){
								case 0:
									var options = {
										method: 'wall.getById',
										params: {
											posts: gid + '_' + pid,
											copy_history_depth: 2,
											access_token: req.session.oauth.vkontakte.access_token,
											v: 5.24
										}
									};

									var options2 = {
										method: 'wall.getComments',
										params: {
											owner_id: gid,
											post_id: pid,
											access_token: req.session.oauth.vkontakte.access_token,
											extended: 1,
											v: 5.24
										}
									};

									var options3 = {
										method: 'groups.getById',
										params: {
											group_ids: Math.abs(gid),
											fields: 'city,country,place,description,wiki_page,members_count,counters,start_date,finish_date,can_post,can_see_all_posts,activity,status,contacts,links,fixed_post,verified,site',
											v: 5.24,
											access_token: req.session.oauth.vkontakte.access_token
										}
									};

									var options4 = {
										method: 'wall.get',
										params: {
											owner_id: gid,
											count: 1,
											filter: 'owner',
											v: 5.24,
											access_token: req.session.oauth.vkontakte.access_token
										}
									};

									deferred(
										api.vkontakte.executeMethod(options),
										api.vkontakte.executeMethod(options2),
										api.vkontakte.executeMethod(options3),
										api.vkontakte.executeMethod(options4)
										)(function(data){

										var URIre = /\b(?:https?|ftp):\/\/[a-z\u00c0-\u01bf0-9-+&@#\/%?=~_|!:,.;]*[a-z\u00c0-\u01bf0-9-+&@#\/%=~_|]/gim;

										var result = {
											post: data[0].response,
											comments: data[1].response,
											wall: data[2].response,
											group: data[3].response,
											source: src,
											href: 'https://vk.com/public' + Math.abs(gid) + '?w=wall' + gid.toString() + '_' + pid
										};

										result.post[0].links = result.post[0].text.match(URIre);
										result.post[0].text = result.post[0].text
											.replace(/\[.*\|(.*)\]/, '$1')
											.replace(URIre, '');

										result.comments.items = _.map(result.comments.items, function(i){
											i.text = i.text.replace(/\[.*\|(.*)\]/, '$1');
											i.date = moment(i.date * 1000).format('lll');
											return i;
										});

										result.post[0].date = moment(result.post[0].date * 1000).format('lll');

										res.send(result);
									});

									break;
								case 1:
									api.facebook.executeMethod('/' + pid, {access_token: req.session.oauth.facebook.access_token})
									.then(function(postRes){
										//log.trace(postRes);

										deferred(api.facebook.executeMethod('/' + postRes.from.id + '/picture', {redirect: false, access_token: req.session.oauth.facebook.access_token}),
											api.facebook.executeMethod('/' + postRes.from.id, {access_token: req.session.oauth.facebook.access_token}))
										(function(data){
											log.trace(data[1]);

											var group = data[1],
												img = data[0];

											log.trace(group);

											postRes.from.picture = img.data.url;
											postRes.source = src;

											log.trace(group);

											res.json(postRes);
										});
										//log.trace(response);
										//response.source = src;
										//res.send(response);
									});

									break;
								case 2:
									var wikiOpts = {query: query, format: "html", summaryOnly: true, lang: 'RU'};

									pWikiSearch(wikiOpts)
									.then(function(data){
										var re_links = /href.*?\>(.*?)\</g;
										data = data.replace(/\<a/g, '<span');
										var matches = data.match(re_links);

										matches = _.map(matches, function(i){
											var title = i.slice(i.indexOf('>') + 1, i.lastIndexOf('<'));
											var href = i.slice(i.indexOf('"') + 1, i.lastIndexOf('"'));
											return {title: title, href: href};
										});

										res.send({data: data, links: matches});
									});
									break;
							}

							break;
					}
				}
			});
		});
	});
});

module.exports = search;
