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
		    , { name: 'type'
			, keyPath: 'type'
		      }
		]
	    }
	]
	, version: 10
    };
    this.dbName = 'tc';
    this.db = new ydn.db.Storage(this.dbName,this.schema);
    this.dataUrl = 'http://127.0.0.1:5984/tc/_design/think/_view';
    this.actions = {};
    this.getActions();
    this.campaigns = {};
    console.log(this.actions);
    // get campaigns
} 

Ext.prototype = {

    getActions: function(){
	var _self = this;
	var req = this.db.from('thing').where('type','=','action');
	req.list(100).done(
	    function(results){
		var action;
		for(var i in results){
		    action = results[i]._id
		    _self.actions[action] = results[i];
		}
	    });
    }

    , load: function(){
	var _self = this;
	console.log('load');
	$.getJSON(this.dataUrl + '/dataByCampaignAction'
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
	var _self = this;
	var req ;
	var campaign;
	if(request.handle.match(/^domain:/)){
	    console.log(handle);
	    req = tc.db.from('thing').where('handles','^',handle.split('/')[0]);
	    req.list(100).done(
		function(results){
		    console.log(results,handle);
		    for(var i in results){
			for(var k in results[i].handles){
			    console.log(k, results[i].handles,results[i].handles[k].indexOf(handle));
			    if(handle.indexOf(results[i].handles[k]) == 0){
				for(var j in results[i].campaigns){
				    campaign = results[i].campaigns[j];
				    console.log(campaign.action);
				    campaign.action = _self.actions[campaign.action];
				    console.log(_self.actions,j,campaign.action);
				}
				request['results'] = results;
				console.log(request);
				callback(request);
				return;
			    }
			}
		    }
		});
	} else {
	    req = tc.db.from('thing').where('handles','=',handle);
	    req.list(1).done(
		function(results){
		    if(results[0]){
			for(var j in results[0].campaigns){
			    campaign = results[0].campaigns[j];
			    campaign.action = _self.actions[campaign.action];
			    
			}
			request['results'] = results;
			callback(request);
		    }
		});
	}
    }
    
}

var tc = new Ext();

function onRequest(request, sender, callback) {
    console.log(request);
    if(request.kind == 'pageA'){
	chrome.pageAction.setIcon({tabId:sender.tab.id,path:request.icon});
	chrome.pageAction.show(sender.tab.id);
    } else if(request.handle){
	console.log('handle',request.handle);
	tc.lookup(request.handle,request,callback);
    } else {
	console.log("couldn't get a handle",request);
    }   
}

chrome.extension.onRequest.addListener(onRequest);
chrome.pageAction.onClicked.addListener(
    function(tab){
	chrome.tabs.sendMessage(tab.id,{kind: 'tcPopD'});
    });
