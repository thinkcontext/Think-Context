const { reject, defer } = require('sdk/core/promise');
// const config = require('config');
// const L = require('logger');

let Pouch = require('./pouchdb/dist/pouchdb-nightly');
var db;

Pouch('domain',function(err,pouchdb){
    if(err){
	console.log('err opening pouchdb');
    } else {
	db = pouchdb;
db.get('f2281e18486cdff1aa5633f966001b4c'
	  ,function(err,doc){
	      if(err)
		  console.log(err);
	      else
		  console.log(doc);
	  });    }
});

Pouch.replicate('domain','http://localhost:5984/domain'
		,function(err,pouchdb){
		    if(err){
			console.log('err replicating pouchdb');
		    }
		});

