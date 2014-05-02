function Ext(){
    this.debug = 0;
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
    this.campaigns = {};
    this.availableActions = {};
    this.availableCampaigns = {};
    this.getAvailableActions();
    this.getAvailableCampaigns();
    this.getSubscribed();
} 

Ext.prototype = {

    getSubscribed: function(){
	var c, a;
	if(c = localStorage['campaigns']){
	    this.campaigns = JSON.parse(c);
	}
	if(a = localStorage['actions']){
	    this.actions = JSON.parse(a);
	}
    },

    getAvailableActions: function(){
	var _self = this;
	var req = this.db.from('thing').where('type','=','action');
	req.list(100).done(
	    function(results){
		var action;
		for(var i in results){
		    action = results[i].tid
		    _self.availableActions[action] = results[i];
		}
	    });
    },
    getAvailableCampaigns: function(){
	var _self = this;
	var req = this.db.from('thing').where('type','=','campaign');
	req.list(100).done(
	    function(results){
		_self.debug >= 2 && console.log('getCampaigns result',results);
		var campaign;
		for(var i in results){
		    campaign = results[i].tid
		    _self.availableCampaigns[campaign] = results[i];
		}
	    });
    },

    sync: function(depth){
	if(depth >= 100){
	    console.error('Over 100 sync recursions!', localStorage['seq']);
	    return;
	}
	var _self = this;
	var seq = localStorage['seq'] || 0;
	var z = 'http://127.0.0.1:5984/tc/_changes' //?timeout=20000&include_docs=true&since=0&limit=10'
	$.getJSON(z, 
		  {timeout:20000,include_docs:true,since:seq,limit:500} ,
		  function(data){
		      if(data.results.length == 0)
			  return;
		      console.log(data);
		      var req, rows = data.results.map(function(x){
			  delete x.doc._rev; // save some space
			  return x.doc;
		      });	
		      if(rows.length > 0){
			  req = _self.db.put('thing',rows);
			  req.done(function(key) {
			      localStorage['seq'] = data.last_seq;
			      console.log(key);
			      setTimeout(function(){_self.sync(depth+1)},2000);
			  });
			  req.fail(function(e) {
			      throw e;
			  });
		      }
		  });	      		      
    },
    sendStat: function(key){
	$.get('http://thinkcontext.org/s/?' + key);
    },
    lookup: function(handle,request,callback){
	var _self = this;
	var req ;
	var campaign;
	if(request.handle.match(/^domain:/)){
	    _self.debug && console.log(handle);
	    req = tc.db.from('thing').where('handles','^',handle.split('/')[0]);
	    req.list(100).done(
		function(results){
		    _self.debug && console.log(results,handle);
		    for(var i in results){
			for(var k in results[i].handles){
			    if(handle.indexOf(results[i].handles[k]) == 0){
				for(var j in results[i].campaigns){
				    campaign = results[i].campaigns[j];
				    campaign.action = _self.actions[campaign.action];
				}
				request['results'] = results;
				_self.debug && console.log(request);
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
			_self.debug && console.log(request);
			callback(request);
		    }
		});
	}
    }
}

var tc = new Ext();

function onRequest(request, sender, callback) {
    if(request.kind == 'pageA'){
	chrome.pageAction.setIcon({tabId:sender.tab.id,path:request.icon});
	chrome.pageAction.show(sender.tab.id);
    } else if(request.handle){
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
// chrome.runtime.onInstalled.addListener(
//     function(details){
// 	if(details.reason == "install"){
// 	    chrome.tabs.create({url:"options.html?install"});
// 	}else if(details.reason == "update"){
// 	    chrome.tabs.create({url:"options.html?update"});
// 	}
//     });
