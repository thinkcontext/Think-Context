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

    , fetch: function(request){

    }

    , lookupCongress: function(request,callback){
	tc.db.from('thing').where('handles','=',request.handle).list(1).done(callback);
    }

}

var tc = new Ext();

function onRequest(request, sender, callback) {
    console.log(request);
    switch(request.kind){
    case 'congress':
	tc.lookupCongress(request,callback);
	break;
    }
}

chrome.extension.onRequest.addListener(onRequest);
