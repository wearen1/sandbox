var MySql = require('then-mysql');
var fs = require('fs');
var deferred = require('deferred'),
	path = require('path'),
	_ = require('lodash'),
	mkdirp = require('mkdirp'),
	natural = require('natural'),
	promisify = deferred.promisify,
	pClassifier = require('./classifier').PrettyClassifier;
	classifier = new natural.BayesClassifier();


var read_file = promisify(fs.readFile, 2);




natural.BayesClassifier.load('./classifier/classifierRU.json', natural.PorterStemmerRu, function(err, classifier) {   
	// classifier.train();

	['Яндекс деньги'].forEach(function(word){
		console.log(classifier.classify(word));
	});
	// classifier.save('./classifier/classifierRU3.json');
});


// var prepareClassifier = function(){
// 	var d = deferred();


// 	.then(function(c){
// 		// var trainPath = path.resolve('../classifier', 'train');
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

// prepareClassifier()
// .then(function(classifier){
// 	classifier.
// 	vk.index(classifier)
// 	.then(function(){
// 		console.log('vk indexed');
// 	});

// });

// var write_file = promisify(fs.writeFile, 2);

var pool = new MySql({
	host: 'localhost',
	user: 'pvf',
	password: 'qwe123'
});

var count = 0;

// classifier('./classifierEN.json', false, false)
// .then(function(enC){
// natural

// natural.BayesClassifier.load('./classifier/classifierRU.json', null, function(err, classifier) {
//     console.log(classifier.classify('long SUNW'));
//     console.log(classifier.classify('short SUNW'));
// });

// classifier.load

//loads classifier from db
// pClassifier('./classifierRU.json', false, true)
// .then(function(ruC){	
// 		pool.query('SELECT dmoz.categories.Title, dmoz.categories.Topic, dmoz.externalpages.Description FROM dmoz.categories JOIN dmoz.externalpages ON dmoz.externalpages.catid=dmoz.categories.catid WHERE dmoz.categories.Topic LIKE \'Top/World/Russian/%\'')
// 		.then(function(results){
// 			_
// 			.forEach(results, function(result){
// 				console.log(count++);
// 				ruC.append(result.Description, result.Topic);
// 			});
// 			ruC.save('classifierRU.json');
// 	});
// });


// pool.query('SELECT dmoz.categories.Title, dmoz.categories.Topic, dmoz.externalpages.Description FROM dmoz.categories JOIN dmoz.externalpages ON dmoz.externalpages.catid=dmoz.categories.catid WHERE dmoz.categories.Topic NOT LIKE \'Top/World/%\' LIMIT 1500000, 300000')
