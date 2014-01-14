const { reject, defer } = require('sdk/core/promise');
// const config = require('config');
// const L = require('logger');

let Pouch = require('./pouchdb/dist/pouchdb-nightly');
var db;

db = new Pouch('tc');
db.replicate.from('http://localhost:5984/tc');



// Pouch('domain',function(err,pouchdb){
//     if(err){
// 	console.log('err opening pouchdb');
//     } else {
// 	db = pouchdb;   
//     }
// });

// Pouch.replicate('domain','http://localhost:5984/tc'
// 		,function(err,pouchdb){
// 		    if(err){
// 			console.log('err replicating pouchdb');
// 		    }
// 		});

db.get('domain-acehardware.com'
	  ,function(err,doc){
	      if(err)
		  console.log('error',err.message);
	      else
		  console.log('doc',doc._id);
	  }); 
