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
		    , { name: 'campaigns'
			, keyPath: 'campaign_list'
			, multiEntry: true
		      }
		]
	    }
	]
	, version: 13
    };
    this.dbName = 'tc';
    this.db = new ydn.db.Storage(this.dbName,this.schema);
    this.dataUrl = 'http://127.0.0.1:5984/tc/_changes';
    this.actions = {};
    this.campaigns = {};
    this.getSubscribed();
    this.getOptions();
} 

Ext.prototype = {

    resetDB: function(callback){
	localStorage['seq'] = 0;
	this.db.clear('thing').done(
	    function(){
		if(typeof callback == 'function')
		    callback();
	    });
    },

    saveCampaigns: function(campaigns){
	var _self = this;

	// just reload for now, later
	// delete unsubscribed campaigns
	// filter sync new ones

	localStorage['campaigns'] = JSON.stringify(campaigns);
	_self.resetDB( function(){ _self.sync(0) });
    },

    getSubscribed: function(){
	var _self = this, c;
	if(c = localStorage['campaigns']){
	    _self.campaigns = JSON.parse(c);
	    _self.getAvailableCampaigns(
		function(campaigns){ 
		    var camp, actions = [];
		    for(var i in campaigns){
			camp = campaigns[i];
			if(_self.campaigns.indexOf(camp.tid) >= 0){
			    camp.actions.forEach(
				function(el,i,arr){ actions.push(el); }
			    );
			}
		    }
		    actions = _self.uniqueArray(actions);
		    if(actions.length > 0){		
			_self.getAvailableActions(
			    function(availableActions){ 
				var a;
				for(var i in availableActions){
				    a = availableActions[i];
				    if(actions.indexOf(a.tid) >= 0)
					_self.actions[a.tid] = a;
				}
				
			    }
			);
		    }
		});
	}
    },

    getAvailableActions: function(callback){
	var _self = this, ret = {};
	var req = this.db.from('thing').where('type','=','action');
	req.list(1000).done(
	    function(results){
		var action;
		for(var i in results){
		    action = results[i].tid
		    ret[action] = results[i];
		}
		callback(ret);
	    });
    },
    getAvailableCampaigns: function(callback){
	var _self = this, ret = {};
	var req = this.db.from('thing').where('type','=','campaign');
	req.list(1000).done(
	    function(results){
		_self.debug >= 2 && console.log('getCampaigns result',results);
		var campaign;
		for(var i in results){
		    campaign = results[i].tid
		    ret[campaign] = results[i];
		}
		callback(ret);
	    });
    },

    sync: function(depth){
	if(depth >= 100){
	    console.error('Over 100 sync recursions!', localStorage['seq']);
	    return;
	}
	var _self = this;
	var seq = localStorage['seq'] || 0;
	$.getJSON(_self.dataUrl, 
		  {timeout:20000,include_docs:true,since:seq,limit:500} ,
		  function(data){
		      if(data.results.length == 0){
			  _self.getSubscribed();
			  return;
		      }
		      var req, rows = data.results, deleted = [], insert = [];
		      for(var x in rows){
			  if(rows[x]._deleted){
			      deleted.push(rows.splice(x,1));
			  } else {		      
			      delete rows[x].doc._rev; // save some space
			      insert.push(rows[x].doc);
			  }

		      }
		      if(deleted.length > 0){
			  for(var x in deleted){
			      _self.db.remove('thing',deleted[x]._id).done();
			  }
		      }
		      if(insert.length > 0){
			  req = _self.db.put('thing',insert);
			  req.done(function(key) {
			      localStorage['seq'] = data.last_seq;
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
		    request.results = [];
		    for(var i in results){
			for(var k in results[i].handles){
			    if(handle.indexOf(results[i].handles[k]) == 0){
				for(var j in results[i].campaigns){
				    campaign = results[i].campaigns[j];
				    campaign.action = _self.actions[campaign.action];
				}
				request.results.push(results[i]);
				break;
			    }
			}
		    }
		    if(request.results.length > 0){
			_self.debug && console.log('domain returning',request);
			_self.resultsPrep(request,callback);
		    }
		    return;			    		
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
			_self.resultsPrep(request,callback);
		    }
		});
	}
    },

    resultsPrep: function(request,callback){
	var _self = this;
	if(request.kind == 'pop'){
	    switch(_self.popd){
	    case 'never':
		request.popD = false;
		break;
	    case 'every':
		request.popD = true;
		break;
	    case 'session':
		if(! sessionStorage.getItem('tcPopD_' + request.handle)){
		    request.popD = true;
		    sessionStorage.setItem('tcPopD_' + request.handle,1);
		} else {
		    request.popD = false;
		}
		break;
	    default:
		if(! localStorage.getItem('tcPopD_' + request.handle)){
		    request.popD = true;
		    localStorage.setItem('tcPopD_' + request.handle,1);
		} else {
		    request.popD = false;
		}		
	    }
	}
	callback(request);
    },

    getOptions: function(){
	var _self = this;
	_self.popd = localStorage['opt_popD'];
    },

    uniqueArray:  function(a) {
	if(a)
	    return a.reduce(function(p, c) {
		if (p.indexOf(c) < 0) p.push(c);
		return p;
	    }, []);
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
