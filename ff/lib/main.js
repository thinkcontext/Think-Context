var ydn = require('./ydn.db-1.0.2.js');

var s = require("sdk/self");
var data = s.data;
var pageMod = require("sdk/page-mod");
var iconDir = s.data.url("icons");
var tabs = require("sdk/tabs");
var ss = require("sdk/simple-storage");
var time = require("sdk/timers");
setTimeout = time.setTimeout;
clearTimeout = time.clearTimeout;
setInterval = time.setInterval;
clearInterval = time.clearInterval;

// var db = new ydn.db.Storage('tc');
// console.log(db.getName());
// var clog = function(r) { console.log(r.value); }

// db.put({name: "store1", keyPath: "id"}, {id: "id1", value: "value1"});
// db.put({name: "store1", keyPath: "id"}, {id: "id2", value: "value2"});

// db.get("store1", "id1").done(clog);

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
		    , { name: 'notification_date'
			,keyPath: 'notification_date'
		      }
		]
	    }
	]
	, version: 15
    };
    _self.dbName = 'tc';
    _self.db = new ydn.db.Storage(_self.dbName,_self.schema);
    _self.couch = 'http://127.0.0.1:5984/tc';
    _self.dataUrl = _self.couch + '/_changes';
    _self.campaignsActionsUrl = _self.couch + '/_design/think/_view/campaignsActions';
    _self.versionUrl = 'http://www.thinkcontext.org/version.json'
    _self.syncing = false;
    _self.actions = {};
    _self.campaigns = {};
    _self.getSubscribed();
    _self.getOptions();
    _self.getNotifications();
    setInterval(function(){_self.getNotifications()}, 4.2 * 3600 * 1000);

    // sync after a short interval to not cause lag on startup
    // before syncing check that we haven't recently done a sync
    // then check that we have a sane sequence number
    // finally, run syncs periodically

    var seq = _self.lsGet('seq');
    var lastSyncTime = _self.lsGet('lastSyncTime')||0;
    if( (new Date) - (new Date(lastSyncTime)) > 4 * 3600 * 1000){
	setTimeout(
    	    function(){
		_self.debug && console.log('sync did timeout');
    		if(seq && seq > 0){
    		    $.getJSON(_self.couch,null
    			      ,function(result){
    				  if(result.update_seq < seq){
    				      _self.debug && console.error("local sequence is greater than remote, resetting to zero");
    				      _self.resetDB(_self.sync(0));
    				  } else {
				      _self.sync(0);
				  }
    			      });
    		} else {
    		    _self.sync(0);
    		}
    	    }
    	    , 10 * 60 * 1000); // 10 minutes 
    }
    setInterval(function(){_self.sync(0)}, 4 * 3600 * 1000);  // 4hrs
}

Ext.prototype = {

    resetDB: function(callback){
	this.lsSet('seq',0);
	this.lsRm('lastSyncTime');
	this.db.clear('thing').done(
	    function(){
		if(typeof callback == 'function')
		    callback();
	    });
    },

    saveCampaigns: function(campaigns){
	var _self = this;
	campaigns = campaigns.sort();
	if(campaigns.join(',') != _self.campaigns.join(',')){
	    _self.lsSet('campaigns',JSON.stringify(campaigns));
	    _self.campaigns = campaigns;
	    _self.resetDB( function(){ _self.sync(0) });
	}
    },

    getSubscribed: function(){
	var _self = this, c;
	if(c = _self.lsGet('campaigns')){
	    _self.campaigns = JSON.parse(c).sort();
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
	if(depth == 0 && _self.syncing){
	    console.error("already syncing");
	    return;
	} else {
	    _self.syncing = true;
	}
	_self.lsSet('lastSyncTime', (new Date).toJSON());
	var seq = _self.lsGet('seq') || 0;

	// check if there was an error
	// if so start over, depth will prevent infinite loop
	if(_self.lsGet('syncError')){
	    _self.lsSet('seq',0);
	    _self.lsRm('syncError',0);
	    seq = 0;
	}

	if(depth >= 100){
	    console.error('Over 100 sync recursions!', seq);
	    _self.syncing = false;
	    return;
	} else if(_self.campaigns.length == 0){
	    console.error('No campaigns to find!');
	    _self.syncing = false;	    
	    return;
	}	    

	$.getJSON(_self.dataUrl, 
		  {timeout:20000
		   ,include_docs:true
		   ,since:seq
		   ,limit:500
		   ,camps: _self.campaigns.join(',')
		   ,filter:'rep/client'
		   ,rando: Math.random() // remove me, pierces cache
		  } ,
		  function(data){
		      if(data.last_seq < seq){
			  _self.resetDB(_self.sync(0));
			  return;
		      }			  
		      if(data.results.length == 0){
			  _self.getSubscribed();
			  _self.syncing = false;
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
			  req.done();
			  req.fail(function(e) {
			      // there was a insert problem 
			      // set the error flag that will get acted on 
			      // by the next sync call
			      _self.lsSet('syncError', true);
			      console.error(e);
			  });
		      }
		      _self.lsSet('seq',data.last_seq);
		      _self.sync(depth+1);
		  });	      		      
    },
    sendStat: function(key){
	if(key.match(/^\w+$/))
	    $.get('http://thinkcontext.org/s/?' + key);
    },
    lookup: function(handle,request,callback){
	var _self = this;
	var req ;
	var campaign, hmatch;
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
				hmatch = results[i].handles[k];
				for(var j in results[i].campaigns){
				    if(_self.campaigns.indexOf(j) >= 0){
					campaign = results[i].campaigns[j];
					campaign.action = _self.actions[campaign.action];
				    }
				}
				request.results.push(results[i]);
				break;
			    }
			}
		    }
		    if(request.results.length > 0){
			_self.debug && console.log('domain returning',request);
			_self.resultsPrep(request,callback,hmatch);
		    }
		    return;			    		
		});
	} else {
	    req = tc.db.from('thing').where('handles','=',handle);
	    req.list(1).done(
		function(results){
		    if(results[0]){
			for(var j in results[0].campaigns){
			    if(_self.campaigns.indexOf(j) >= 0){
				campaign = results[0].campaigns[j];
				campaign.action = _self.actions[campaign.action];
			    }
			}
			request['results'] = results;
			_self.debug && console.log(request);
			_self.resultsPrep(request,callback,handle);
		    }
		});
	}
    },

    resultsPrep: function(request,callback,hmatch){
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
		if(! sessionStorage.getItem('tcPopD_' + hmatch)){
		    request.popD = true;
		    sessionStorage.setItem('tcPopD_' + hmatch,1);
		} else {
		    request.popD = false;
		}
		break;
	    default:
		if(! _self.lsGet('tcPopD_' + hmatch)){
		    request.popD = true;
		    _self.lsSet('tcPopD_' + hmatch,1);
		} else {
		    request.popD = false;
		}		
	    }
	}
	callback(request);
    },

    getOptions: function(){
	var _self = this;
	_self.popd = _self.lsGet('opt_popD');
    },
    
    sendNotification: function(title,message){
	// port me
	// chrome.notifications.create(
	//     result._id
	//     , {type: "basic"
	//        , title: title
	//        , message: message
	//        , iconUrl: 'icons/tc-64.png'
	//       }
	//     , function(x){}	    );
    },
    
    getNotifications: function(){
	var _self = this;
	var lnt = _self.lsGet('lastnotifytime');
	var now = new Date;
	if(lnt){
	    if(now - new Date(lnt) > 7 * 24 * 3600 * 1000){  // one week
		_self.checkOldVersion();
		_self.db.from('thing').where('type','=','notification').list(1000).done(
		    function(results){
			var result;
			for(var i in results){
			    result = results[i];
			    if(result.notification_date >= lnt && result.kind == 'meta'){
				_self.sendNotification(result.title,result.text);
			    }
			}
		    }
		);
	    }
	} else {	
	    _self.lsSet('lastnotifytime',now);
	}
    },
    
    checkOldVersion: function(){	
	var _self = this, vt =_self.getVersionTime(), now = new Date, currentVersion = chrome.runtime.getManifest().version;
	if(vt && now - vt > (1000 * 3600 * 24 * 30)){
	    // its been a month so lets check    
	    $.getJSON(_self.versionURL,
		      function(results){
			  if(results.releaseDate - vt > 1000 * 3600 * 24 * 14 && results.version != currentVersion){
			      _self.sendNotification("New Version Available","A new version is available and the one installed is more than 2 weeks out of date");
			  }
		      });
	} else {
	    _self.setVersionTime();
	}

    },
    
    uniqueArray:  function(a) {
	if(a)
	    return a.reduce(function(p, c) {
		if (p.indexOf(c) < 0) p.push(c);
		return p;
	    }, []);
    },
    
    fetchCampaignsActions: function(){
	var _self = this;
	$.getJSON(_self.campaignsActionsUrl,
	      function(data){
		  var insert = [], req;
		  for(var i = 0; i < data.rows.length; i++){
		      delete data.rows[i].value._rev;  // save some space
		      insert.push(data.rows[i].value);		      
		  }
		  if(insert.length > 0){
		      req = _self.db.put('thing',insert);
		      req.done();
		      req.fail(function(e) {
			  console.error('error inserting initial campaign/action list',e);
		      });		      
		  }
	      });
    },

    initialCamps: function(){
	var _self = this;
	if(_self.lsGet('campaigns')) // there's existing config so return
	    return;

	_self.fetchCampaignsActions();
	var newCamps = ['congress','climatecounts'];
	[ 'opt_rush','opt_green','opt_hotel','opt_bechdel', 'opt_bcorp', 'opt_roc','opt_hrc' ].forEach(
	    function(o){
		if(_self.lsGet(o) != 0){
		    newCamps.push(o.replace('opt_',''));
		}
		_self.lsRm(o);
	    });
	_self.lsSet('campaigns', JSON.stringify(newCamps));    
    },
    lsSet: function(x,y){
	ss.storage[x] = y;
    },
    lsGet: function(x){
	return ss.storage[x];
    },
    lsRm: function(x){
	ss.storage[x] = null;
    },
    setVersionTime: function(){
	var _self = this, d = new Date;
	_self.lsSet('versionTime', d.toJSON());
    },
    getVersionTime: function(){
	var _self = this, j, ret;
	j = _self.lsGet('versionTime');
	if(j)
	    ret = new Date(j);
	return ret;
    }
}

var tc = new Ext();

// port me
// chrome.pageAction.onClicked.addListener(
//     function(tab){
// 	chrome.tabs.sendMessage(tab.id,{kind: 'tcPopD'});
//     });


if(s.loadReason == 'upgrade'){
    tc.initialCamps();
    tc.setVersionTime();
    tc.getSubscribed();
    //tc.sync(0);  // uncomment me
    //tabs.open(data.url('update.html'));
} else if(s.loadReason == 'install'){
    tc.initialCamps();
    tc.setVersionTime();
    tc.getSubscribed();
    //tc.sync(0);  // uncomment me
    //tabs.open(data.url('install.html'));
}


// port me
// chrome.notifications.onClicked.addListener(
//     function(notificationId){
// 	chrome.tabs.create({url:"options.html"});
//     });


// browser specific
// function onRequest(request, sender, callback) {
//     if(request.kind == 'pageA'){
// 	chrome.pageAction.setIcon({tabId:sender.tab.id,path:request.icon});
// 	chrome.pageAction.show(sender.tab.id);
//     } else if(request.kind == 'sendstat' && !sender.tab.incognito){
// 	tc.sendStat(request.key);
//     } else if(request.handle){
// 	tc.lookup(request.handle,request,callback);
//     } else {
// 	console.log("couldn't get a handle",request);
//     }   
// }

pageMod.PageMod({
    include : ["*.www.google.com",
	       "*.maps.google.com"],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-2.0.3.min.js')
	,data.url('jquery-ui-1.9.2.custom.min.js')
	,data.url('ejs_production.js') 
	,data.url('mutation-summary.js')
	,data.url('jquery.mutation-summary.js')
	,data.url('utils.js')
	,data.url('reverse.js')
	,data.url('google-search.js')],
    onAttach: function(worker){
	worker.on('message', function(request){
	    if(request.kind == 'pageA'){
		// 	chrome.pageAction.setIcon({tabId:sender.tab.id,path:request.icon});
		// 	chrome.pageAction.show(sender.tab.id);
	    } else if(request.kind == 'sendstat' && !sender.tab.incognito){
 		tc.sendStat(request.key);
	    } else if(request.handle){
		tc.lookup(request.handle,request, function(r){ worker.postMessage(r) });
	    } else {
 		console.log("couldn't get a handle",request);
	    }
	}   		  
		 )}});
		
