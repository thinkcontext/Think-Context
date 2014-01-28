var tc = {
    schema: { 
	stores: [
	    {
		name: 'thing'
		, keyPath: '_id'
		, indexes: [
		    { keyPath: 'handles'
		      , multiEntry: true
		    }
		]
	    }
	]
	, version: 7
    }
    , dbName: 'tc'
    , db: new ydn.db.Storage(this.dbName,this.schema)
    , dataUrl: 'http://127.0.0.1:5984/tc/_design/think/_view'
    
    , load: function(){
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
};
