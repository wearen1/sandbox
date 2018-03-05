api = require appRoot + '/api'
db = require appRoot + '/db'
lib = require appRoot + '/lib'
log = lib.log()

_ = lib.get '_'
AWS = lib.get 'aws'
config = lib.get 'config'
express = lib.get 'express'
moment = lib.get 'moment'

mongodb = lib.get 'mongodb'
mongoose = lib.get 'mongoose'

Promise = lib.get 'bluebird'
wikipedia = lib.get 'wikipedia'

AWS.config.update
  region: config.aws.region

s3 = Promise.promisifyAll new AWS.S3()
MongoClient = mongodb.MongoClient
ObjectID = mongodb.ObjectID
QueryAPI = new (require './queryAPI')

# s3.listBucketsAsync()
# .then (data)->
#   log.info data
#   s3.listObjectsAsync
#     Bucket: 'runexto'
# .then (data)->
#   log.info data
#   s3.upload
#     Bucket: 'runexto'
# .catch (e)->
#   log.error e

moment.locale 'ru'
search = express.Router()

#global collections
global.authors = Promise.promisifyAll mc.collection 'authors'
global.posts = Promise.promisifyAll mc.collection 'posts'

db.ensureIndexes()
.then (indexes) ->
  log.info "indexes: #{indexes} ensured"

  search.post '/search', (req, res, next)->
    body = req.body
    session = req.session

    log.trace body

    unless req.session and body.query
      res.json
        status: 'error'
        error: 'Invalid params'
    else
      sources = body.sources
      query = body.query || ''
      from = body.from || 'groups'
      page = body.page || 0

      #array for querying tasks
      tasks = {}
      #make sources unique for some cases ;-)
      sources = _.uniq sources
      #format is: ['vk_groups', 'vk_events', 'vk_posts'] etc.
      _.map sources, (source)->
        k = source.split('_')[0]
        v = source.split('_')[1]

        if QueryAPI[k]?[v]?
          tasks[source] = QueryAPI[k][v] session, query,
            from: from
            page: page

      Promise.props tasks
      .then (results)->
        res.json results


  search.post '/preview', (req, res, next)->
    session = req.session
    body = req.body

    log.trace session.settings

    unless session and session.user
      return res.status(200).json
        error: 'not authorized'

    src = body.source
    pid = body.post
    gid = switch session.settings.search.sources.posts_of
      when 'groups' then -Math.abs(body.group)
      when 'people' then Math.abs(body.group)
    query = body.query

    log.info src, pid, gid, query

    switch src
      when 'vk'
        optionsWallGetById =
          method: 'wall.getById'
          params:
            posts: gid + '_' + pid
            copy_history_depth: 2
            access_token: session.oauth.vk.access_token
            v: config.api.vk.v
        optionsCommentsGet =
          method: 'wall.getComments'
          params:
            extended: 1
            owner_id: gid
            post_id: [Math.abs(pid)]
            access_token: session.oauth.vk.access_token
            v: config.api.vk.v
        optionsGroupGetById =
          switch session.settings.search.sources.posts_of
            when 'groups'
              method: 'groups.getById'
              params:
                group_ids: Math.abs(gid)
                fields: 'city,country,place,description,wiki_page,members_count,counters,start_date,finish_date,can_post,can_see_all_posts,activity,status,contacts,links,fixed_post,verified,site'
                access_token: session.oauth.vk.access_token
                v: config.api.vk.v
            when 'people'
              method: 'users.get'
              params:
                user_ids: Math.abs(gid)
                fields: 'sex,bdate,city,country,photo_50,photo_100,photo_200_orig,photo_200,photo_400_orig,photo_max,photo_max_orig,photo_id,online,online_mobile,domain,has_mobile,contacts,connections,site,education,universities,schools,can_post,can_see_all_posts,can_see_audio,can_write_private_message,status,last_seen,common_count,relation,relatives,counters,screen_name,maiden_name,timezone,occupation,activities,interests,music,movies,tv,books,games,about,quotes,personal,friends_status'
                access_token: session.oauth.vk.access_token
                v: config.api.vk.v
        optionsWallGet =
          method: 'wall.get'
          params:
            owner_id: gid
            count: 1
            filter: 'owner'
            access_token: session.oauth.vk.access_token
            v: config.api.vk.v
        Promise.props
          posts: api.vk.executeMethod optionsWallGetById
          comments: api.vk.executeMethod optionsCommentsGet
          wall: api.vk.executeMethod optionsGroupGetById
          group: api.vk.executeMethod optionsWallGet
        .then (data)->
          log.info data.wall

          URIre = /\b(?:https?|ftp):\/\/[a-z\u00c0-\u01bf0-9-+&@#\/%?=~_|!:,.;]*[a-z\u00c0-\u01bf0-9-+&@#\/%=~_|]/gim
          result =
            post: data.posts.response[0]
            comments: data.comments.response
            wall: data.wall.response[0]
            group: data.group.response
            source: src

          result.href = "https://vk.com/#{result.wall.screen_name}?w=wall#{result.post.from_id}_#{result.post.id}"
          result.post.links = result.post.text.match URIre
          result.post.text = result.post.text
          .replace /\[.*\|(.*)\]/, '$1'
          .replace URIre, ''

          result.comments.items = _.map result.comments.items, (i)->
            i.text = i.text.replace /\[.*\|(.*)\]/, '$1'
            i.date = moment(i.date * 1000).format 'lll'
            return i
          result.post.date = moment(result.post.date * 1000).format 'lll'

          res.json result
        .catch (e)->
          log.error e
          res.json
            status: 'error'
            error: e
      when 'fb'
        api.fb.executeMethod '/' + pid,
          access_token: session.oauth.fb.access_token
        .then (postRes)->
          Promise.props
            img: api.fb.executeMethod '/' + postRes.from.id + '/picture',
              redirect: false
              access_token: session.oauth.fb.access_token
            group: api.fb.executeMethod '/' + postRes.from.id,
              access_token: session.oauth.fb.access_token
          .then (data)->
            img = data.img
            group = data.group
            postRes.from.picture = img.data.url
            postRes.source = src

            res.json postRes


  search.post '/api/like', (req, res, next)->
    session = req.session
    body = req.body

    pid = body.post
    gid = body.group

    api.vk.executeMethod
      method: 'likes.add'
      params:
        type: 'post'
        owner_id: gid
        item_id: pid
        access_token: req.session.oauth.vk.access_token
        v: 5.24
    .then (data)->
      res.json
        status: 'ok'
        data: data
    .catch (e)->
      res.json
        status: 'error'
        error: e

  search.post '/api/repost', (req, res, next)->
    session = req.session
    body = req.body

    pid = body.post
    gid = body.group

    api.vk.executeMethod
      method: 'wall.repost'
      params:
        object: 'wall' + gid + '_' + pid
        access_token: req.session.oauth.vk.access_token
        v: 5.24
    .then (data)->
      res.json
        status: 'ok'
        data: data
    .catch (e)->
      res.json
        status: 'error'
        error: e


  search.post '/api/comment', (req, res, next)->
    session = req.session
    body = req.body

    msg = body.message
    pid = body.post
    gid = body.group

    api.vk.executeMethod
      method: 'wall.addComment'
      params:
        owner_id: gid
        post_id: pid
        text: _.escape msg
        access_token: session.oauth.vk.access_token
        v: 5.24
    .then (data)->
      res.json
        status: 'ok'
        data: data
    .catch (e)->
      res.json
        status: 'error'
        error: e


module.exports = search


# db.connections.on('open')
# .then (mc) ->
#   authors = mc.collection 'authors'
#   posts = mc.collection 'posts'

#   search.get '/search', (req, res, next)->
#     res.redirect '/'

#   search.get '/api/:options', (req, res, next)->
#     try
#       options = JSON.parse decodeURIComponent req.options
#       options.params.access_token = req.session.auth.vkontakte.access_token
#       api.vk.executeMethod options
#       .then (result)->
#         res.json result
#       .catch (e)->
#         next e
#     catch e
#       next e

#   search.post '/api/search/:method', (req, res, next)->
#     body = req.body
#     method = req.params.method
#     query = body.query || ''

#     return next err if not req.session

#     switch method
#       when 'groups'
#         deferred QueryAPI.facebook(req, query),
#           QueryAPI.vkontakte(req, query),
#           QueryAPI.twitter.users(req, query),
#           QueryAPI.twitter.tweets(req, query),
#           QueryAPI.wikipedia(req, query),
#           api.vk.executeMethod
#             method: 'groups.search'
#             params:
#               q: query
#               type: 'event'
#               future: 1
#               sort: 0
#               offset: 0
#               count: 3
#               access_token: req.session.oauth.vkontakte.access_token
#               v: 5.24
#         .done (results)->
#           response = {}
#           response.facebook = results[0] if results[0]?
#           response.vkontakte = results[1] if results[1]?
#           response.twitter = results[2] if results[2]?
#           response.tweets = results[3] if results[3]?
#           response.wiki = results[4].SearchSuggestion?.Section.Item[0]
#           response.events = results[5].response.items

#           if response.events.length isnt 0
#             api.vk.executeMethod
#               method: 'groups.getById'
#               params:
#                 group_ids: _.pluck(response.events, 'id').join ','
#                 fields: 'city,country,place,description,wiki_page,members_count,
#                   counters,start_date,finish_date,can_post,can_see_all_posts,
#                   activity,status,contacts,links,fixed_post,verified,site'
#                 access_token: req.session.oauth.vkontakte.access_token
#                 v: 5.24
#             .then (eventGroups)->
#               eventGroups.response = _.map eventGroups.response, (i)->
#                 i.start_date = moment(i.start_date * 1000).format 'lll'
#                 i.finish_date = moment(i.finish_date * 1000).format 'lll'
#                 return i

#               response.events = _.merge response.events, eventGroups.response
#               log.trace response.events

#               res.json response
#             .catch (err)->
#               next err

#           else
#             res.json response

#       when 'comment'
#         msg = body.message
#         pid = body.post
#         gid = body.group

#         api.vk.executeMethod
#           method: 'wall.addComment'
#           params:
#             owner_id: gid
#             post_id: pid
#             text: _.escape msg
#             access_token: req.session.oauth.vkontakte.access_token
#             v: 5.24
#         .then (data)->
#           res.json data

#       when 'repost'
#         pid = body.post
#         gid = body.group

#         api.vk.executeMethod
#           method: 'wall.repost'
#           params:
#             object: 'wall' + gid + '_' + pid
#             access_token: req.session.oauth.vkontakte.access_token
#             v: 5.24
#         .then (data)->
#           res.json data

#       when 'like'
#         pid = body.post
#         gid = body.group

#         api.vk.executeMethod
#           method: 'likes.add'
#           params:
#             type: 'post'
#             owner_id: gid
#             item_id: pid
#             access_token: req.session.oauth.vkontakte.access_token
#             v: 5.24
#         .then (data)->
#           res.json data

#       when 'posts'
#         authorsArray = []
#         posts
#         .find
#           $text:
#             $search: query
#           type: switch body.from
#             when 'groups' then 0
#             when 'people' then 1
#         ,
#           score:
#             $meta: 'textScore'
#         .sort
#           score:
#             $meta: 'textScore'
#         .limit 10
#         .sort
#           likes: -1
#           reposts: -1
#         .toArray (err, posts)->
#           posts = _.map posts, (post)->
#             post.date = moment(post.date).fromNow()
#             if authorsArray.indexOf(post.author.toString()) isnt -1
#               post.author = authorsArray.indexOf post.author.toString()
#             else
#               authorsArray.push post.author.toString()
#               post.author = authorsArray.length - 1
#             return post

#           authorsArray = _.map authorsArray, (author)->
#             new ObjectID author

#           authors.find
#             _id:
#               $in: authorsArray
#           .toArray (err, authors)->
#             _.forEach authors, (author)->
#               _.forEach posts, (post)->
#                 post.author = author if author._id.toString() is authorsArray[post.author]?.toString()
#             res.json posts

#       when 'preview'
#         src = body.source
#         pid = body.post
#         gid = body.group
#         query = body.query

#         switch src
#           when 0
#             optionsWallGetById =
#               method: 'wall.getById'
#               params:
#                 posts: gid + '_' + pid
#                 copy_history_depth: 2
#                 access_token: req.session.oauth.vkontakte.access_token
#                 v: 5.24
#             optionsCommentsGet =
#               method: 'wall.getComments'
#               params:
#                 extended: 1
#                 owner_id: gid
#                 post_id: pid
#                 access_token: req.session.oauth.vkontakte.access_token
#                 v: 5.24
#             optionsGroupGetById =
#               method: 'groups.getById'
#               params:
#                 group_ids: Math.abs(gid)
#                 fields: 'city,country,place,description,wiki_page,members_count,counters,start_date,finish_date,can_post,can_see_all_posts,activity,status,contacts,links,fixed_post,verified,site'
#                 access_token: req.session.oauth.vkontakte.access_token
#                 v: 5.24
#             optionsWallGet =
#               method: 'wall.get'
#               params:
#                 owner_id: gid
#                 count: 1
#                 filter: 'owner'
#                 access_token: req.session.oauth.vkontakte.access_token
#                 v: 5.24
#             deferred api.vk.executeMethod(optionsWallGetById),
#               api.vk.executeMethod(optionsCommentsGet),
#               api.vk.executeMethod(optionsGroupGetById),
#               api.vk.executeMethod(optionsWallGet)
#             .done (data)->
#               URIre = /\b(?:https?|ftp):\/\/[a-z\u00c0-\u01bf0-9-+&@#\/%?=~_|!:,.;]*[a-z\u00c0-\u01bf0-9-+&@#\/%=~_|]/gim
#               result =
#                 post: data[0].response[0]
#                 comments: data[1].response
#                 wall: data[2].response[0]
#                 group: data[3].response
#                 source: src
#                 href: 'https://vk.com/public' + Math.abs(gid) + '?w=wall' + gid.toString() + '_' + pid
#               result.post.links = result.post.text.match URIre
#               result.post.text = result.post.text
#               .replace /\[.*\|(.*)\]/, '$1'
#               .replace URIre, ''

#               result.comments.items = _.map result.comments.items, (i)->
#                 i.text = i.text.replace /\[.*\|(.*)\]/, '$1'
#                 i.date = moment(i.date * 1000).format 'lll'
#                 return i
#               result.post.date = moment(result.post.date * 1000).format 'lll'

#               log.trace result

#               res.json result
#           when 1
#             api.fb.executeMethod '/' + pid,
#               access_token: req.session.oauth.facebook.access_token
#             .then (postRes)->
#               deferred api.fb.executeMethod(
#                 '/' + postRes.from.id + '/picture',
#                 redirect: false
#                 access_token: req.session.oauth.facebook.access_token
#               ),
#               api.fb.executeMethod(
#                 '/' + postRes.from.id,
#                 access_token: req.session.oauth.facebook.access_token
#               )
#               .then (data)->
#                 img = data[0]
#                 group = data[1]
#                 postRes.from.picture = img.data.url
#                 postRes.source = src

#                 res.json postRes
#           when 2
#             log.debug 'searching wiki'
#             try
#               pWikiSearch
#                 query: query
#                 format: 'html'
#                 summaryOnly: true
#                 lang: 'RU'
#               .then (data)->
#                 log.debug 'data received'
#                 re_links = /href.*?\>(.*?)\</g
#                 data = data.replace /\<a/g, '<span'
#                 matches = data.match re_links
#                 matches = _.map matches, (i)->
#                   title = i.slice i.indexOf '>' + 1, i.lastIndexOf '<'
#                   href = i.slice i.indexOf '"' + 1, i.lastIndexOf '"'
#                   return {
#                     title: title
#                     href:  href
#                   }
#                 res.json
#                   data:data
#                   links: matches
#             catch e
#               log.error e

#   search.use (err, req, res, next)->
#     log.error err
#     res.status(204).end()


# Group = db.models.Group
# Post = db.models.Post
# User = db.models.User

# RailsGroup = db.models.RailsGroup
# RailsVariable = db.models.RailsVariable

# pWikiSearch = promisify wikipedia.searchArticle

# save = (doc)->
#   d = deferred()
#   doc.save (err)->
#     if (!err)
#       d.resolve doc
#     else
#       d.reject err
#     d.promise
