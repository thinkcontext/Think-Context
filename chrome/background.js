function Ext(){
    var _self = this;
    _self.debug = 0;
    _self.schema = { 
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
    _self.dbName = 'tc';
    _self.db = new ydn.db.Storage(_self.dbName,_self.schema);
    _self.couch = 'http://127.0.0.1:5984/tc';
    _self.dataUrl = _self.couch + '/_changes';
    _self.actions = {};
    _self.campaigns = {};
    _self.getSubscribed();
    _self.getOptions();

    // sync but first check that we have a sane sequence number
    var seq = localStorage['seq'];
    // setTimeout(
    // 	function(){
    // 	    if(seq && seq > 0){
    // 		$.getJSON(_self.couch,null
    // 			  ,function(result){
    // 			      if(result.update_seq < seq){
    // 				  _self.debug && console.error("local sequence is greater than remote, resetting to zero");
    // 				  _self.resetDB(_self.sync(0));
    // 			      }
    // 			  });
    // 	    } else {
    // 		_self.sync(0);
    // 	    }
    // 	}
    // 	, 10 * 60 * 1000); // 10 minutes
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
	_self.campaigns = campaigns;
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
	var _self = this;
	var seq = localStorage['seq'] || 0;

	if(depth >= 100){
	    console.error('Over 100 sync recursions!', localStorage['seq']);
	    return;
	} else if(_self.campaigns.length == 0){
	    console.error('No campaigns to find!');
	    return;
	}	    

	//$.getJSON('http://127.0.0.1:5984/tc/_changes',{timeout:20000 ,include_docs:true ,filter:'rep/client' , limit:900,camps:'congress,roc'},function(x){console.log(x)})

	$.getJSON(_self.dataUrl, 
		  {timeout:20000
		   ,include_docs:true
		   ,since:seq
		   ,limit:500
		   ,camps: _self.campaigns.join(',')
		   ,filter:'rep/client'
		   ,rando: Math.random() // remove me
		  } ,
		  function(data){
		      if(data.results.length == 0){
			  _self.getSubscribed();
			  return;
		      }
		      var req, rows = data.results, deleted = [], insert = [];
		      for(var x in rows){
			  if(rows[x].deleted){
			      deleted.push(rows[x].id);
			  } else {		      
			      delete rows[x].doc._rev; // save some space
			      insert.push(rows[x].doc);
			  }
			  
		      }
		      if(deleted.length > 0){
			  for(var x in deleted){
			      _self.db.remove('thing',deleted[x]).done();
			  }
		      }
		      if(insert.length > 0){
			  req = _self.db.put('thing',insert);
			  req.done(function(key) {
			      localStorage['seq'] = data.last_seq;
			      setTimeout(function(){_self.sync(depth+1)},500);
			  });
			  req.fail(function(e) {
			      throw e;
			  });
		      } else {
			  _self.getSubscribed();
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


function initialCamps(){
    if(localStorage['campaigns']) // there's existing config so return
	return;

    var newCamps = ['congress'];
    [ 'opt_rush','opt_green','opt_hotel','opt_bechdel', 'opt_bcorp', 'opt_roc','opt_hrc' ].forEach(
	function(o){
	    if(localStorage[o] != 0){
		newCamps.push(o.replace('opt_',''));
	    }
	    localStorage.removeItem(o);
	});
    localStorage['campaigns'] = newCamps;    
}


chrome.runtime.onInstalled.addListener(
    function(details){
	initialCamps();
	if(details.reason == "install"){	    
	    //chrome.tabs.create({url:"options.html?install"});
	}else if(details.reason == "update"){
	    //chrome.tabs.create({url:"options.html?update"});
	}
    });
