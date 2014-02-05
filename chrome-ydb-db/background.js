function Ext(){
    console.log('init');
    this.schema = { 
	stores: [
	    {
		name: 'thing'
		, keyPath: '_id'
		, indexes: [
		    { name: 'handles'
		      , keyPath: 'handles'
		      , multiEntry: true
		    }
		]
	    }
	]
	, version: 9
    };
    this.dbName = 'tc';
    this.db = new ydn.db.Storage(this.dbName,this.schema);
    this.dataUrl = 'http://127.0.0.1:5984/tc/_design/think/_view';
} 

Ext.prototype = {
    load: function(){
	var _self = this;
	console.log('load');
	$.getJSON(this.dataUrl + '/dataByCampaign'
		  ,function(data){
		      console.log(data);
		      var req, rows = data.rows.map(function(x){return x.value;});		      
		      if(rows.length > 0){
			  req = _self.db.put('thing',rows);
			  req.done(function(key) {
			      console.log(key);
			  });
			  req.fail(function(e) {
			      throw e;
			  });
		      }
		  });
    }
    , update: function(){
	
    }
    , lookup: function(handle,request,callback){
	var req = tc.db.from('thing').where('handles','=',handle);
	req.list(1).done(
	    function(results){
		if(results.length > 0)
		    callback(results);
	    });
    }
}

var tc = new Ext();

function onRequest(request, sender, callback) {
    console.log(request);
    var handle;
    switch(request.kind){
    case 'congress':
	if(request.name && request.name.length > 4)
	    handle = 'name:' + request.name.toLowerCase().replace(/\s/,'');
	break;
    }
    if(handle){
	console.log('handle',handle);
	tc.lookup(handle,request,callback);
    } else {
	console.log("couldn't get a handle",request);
    }   
}

chrome.extension.onRequest.addListener(onRequest);
