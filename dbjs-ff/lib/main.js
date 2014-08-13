var db = require('./db.js');
var Request = require('sdk/request').Request;
var server;

function load(){
    console.log('load');
    Request({url: 'http://127.0.0.1:5984/tc/_design/seq/_view/dataByCampaignSeq?include_docs=true&startkey=%5B%22congress%22%2C0%5D&endkey=%5B%22congress%22%2C%7B%7D%5D&rando=0.743930449243634a&limit=10'
	     , onComplete: function(response){
		 var data = response.json;
		 console.log('onComplete',data.rows.length);
		 if(data.rows && data.rows.length > 0){
		     items = data.rows.map(function(x){ return x.doc});
		     server.thing.add(items).done(function(x){
			 //server.thing.query('handles').only('facebook:senatorpatrickleahy').execute().done(function(x){console.log('fb',x)});
			 server.thing.query('handles').bound('domain:leahy','domain:leahy}').execute().done(function(x){console.log('domain',x)});
		     });
		 }}}).get();
}

db.open( {
    server: 'tc',
    version: 1,
    schema: {
        thing: {
            key: { keyPath: '_id' , autoIncrement: true },
            // Optionally add indexes
            indexes: {
                handles: { multiEntry: true },
                type: { },
		campaign_list: { multiEntry: true },
		notification_date: {}		
            }
        }
    }
} ).done( function ( s ) {
    server = s;
    load();
} );
