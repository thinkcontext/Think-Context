function Ext(){
    var _self = this;
    _self.version = '1.3'
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
    //_self.couch = 'http://127.0.0.1:5984/tc';
    _self.couch = 'http://lin1.thinkcontext.org:5984/tcv1';
    _self.dataUrl = _self.couch + '/_design/seq/_view/dataByCampaignSeq';
    _self.deactivateUrl = _self.couch + '/_design/seq/_view/dataByCampaignDeactivated';
    _self.metaUrl = _self.couch + '/_design/seq/_view/meta';
    _self.metaDeactivatedUrl = _self.couch + '/_design/seq/_view/metaDeactivated';
    _self.versionUrl = 'http://www.thinkcontext.org/version.json'
    _self.actions = {};
    _self.campaigns = {};    

    _self.getSubscribed();
    _self.getOptions();
    _self.getNotifications();
    
    var lastSyncTime = _self.lsGet('lastSyncTime')||0;

    if(! _self.lsGet('tcversion') && ! _self.lsGet('resultsversion')){
	// new install
	_self.lsSet('tcversion',_self.version);
	_self.initialCamps();
	_self.setVersionTime();    
	_self.fetchMetaData(function(){ openInstall(); _self.sync();});    
    } else if(! _self.lsGet('tcversion') && _self.lsGet('resultsversion')){
	// update from sqlite version
	_self.lsSet('tcversion',_self.version);
	_self.initialCamps();
	_self.setVersionTime();
	var olddb = openDatabase('thinkcontext','1.0','thinkcontext',0);
	olddb.transaction(function(tx){
    	    tx.executeSql('drop table template',[]); 
    	    tx.executeSql('drop table place',[]); 
    	    tx.executeSql('drop table place_data',[]); 
    	    tx.executeSql('drop table results',[]); 
	});
	_self.fetchMetaData(function(){ 
	    openUpdate(); 
	    _self.sync();
	});    
    } else if(_self.lsGet('tcversion') != _self.version){
	// update
	_self.lsSet('tcversion',_self.version);
	_self.initialCamps();
	_self.setVersionTime();
	setTimeout(function(){ _self.resetDB(_self.sync); }, 15000);	
    } else if(_self.lsGet('tcversion') == _self.version){	    
	if(lastSyncTime == 0 && _self.getVersionTime()){
    	    // we haven't done a sync before do it immediately
    	    _self.sync();
	} else if( (new Date) - (new Date(lastSyncTime)) > 4 * 3600 * 1000){
    	    // we haven't done one in 4 hrs so do one 
    	    // but wait a little bit first to not lag browser start
    	    setTimeout(
    		function(){
    		    _self.sync();
    		}
    		, 5 * 60 * 1000); // 5 minutes 
	}
    }
    setInterval(function(){_self.sync()}, 4 * 3600 * 1000);  // 4hrs
    setInterval(function(){_self.getNotifications()}, 4.2 * 3600 * 1000);
}

Ext.prototype = {
    resetDB: function(callback){
	var _self = this, campaign;
	_self.lsRm('lastSyncTime');
	_self.lsRm('metaseq');
	_self.lsRm('metadea');
	for(var x = 0; x < _self.campaigns.length; x++){
	    campaign = _self.campaigns[x];
	    _self.lsRm('seq' + campaign);
	    _self.lsRm('dea' + campaign);
	}
	_self.db.clear('thing').done(
	    function(){
		if(typeof callback == 'function')
		    callback();
	    });
    },

    saveCampaigns: function(campaigns){
	var _self = this;
	campaigns = _self.uniqueArray(campaigns.sort());
	if(campaigns.join(',') != _self.campaigns.join(',')){
	    _self.lsSet('campaigns',JSON.stringify(campaigns));
	    _self.campaigns = campaigns;
	    _self.resetDB( function(){ _self.sync() });
	}
    },

    saveOptions: function(request){
	var _self = this;
	var campaigns = _self.uniqueArray(request.campaigns.sort());
	if(campaigns.join(',') != _self.campaigns.join(',')){
	    _self.lsSet('campaigns',JSON.stringify(campaigns));
	    _self.campaigns = campaigns;
	    _self.resetDB( function(){ _self.sync() });
	}
	if(request.options.opt_popD != _self.opt_popD){
	    _self.opt_popD = request.options.opt_popD;
	    _self.lsSet('opt_popD',_self.opt_popD);
	}
    },

    getSubscribed: function(){
	var _self = this, c;
	_self.debug >= 2 && console.log('getSubscribed');
	if(c = _self.lsGet('campaigns')){
	    _self.campaigns = _self.uniqueArray(JSON.parse(c).sort());
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
    
    sendOptions: function(callback){
	var _self = this;
	var ret = { campaigns: _self.campaigns, options: {opt_popD: _self.opt_popD }};
	_self.getAvailableCampaigns(
	    function(x){ 
		ret.availableCampaigns = [];
		for(var z in x){
		    ret.availableCampaigns.push(x[z]);
		}
		_self.getAvailableActions(
		    function(y){ 
			ret.availableActions = y;
			callback(ret);
		    })});
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
	_self.debug >= 2 && console.log("getAvailableCampaigns");
	var req = _self.db.from('thing').where('type','=','campaign');
	req.list(1000).done(
	    function(results){
		_self.debug >= 2 && console.log('getCampaigns result',results.length);
		var campaign;
		for(var i in results){
		    campaign = results[i].tid
		    ret[campaign] = results[i];
		}
		callback(ret);
	    });
    },

    fetchMetaDeactivated: function(callback){
	var _self = this;
	var metaDeact = parseInt(_self.lsGet('metadea')) || parseInt(_self.lsGet('metaseq')) || 0;
	_self.getJSON(_self.metaDeactivatedUrl, 
		  {startkey: metaDeact,
		   //rando: Math.random() // remove me, pierces cache
		  } ,
		  function(data){
		      var rows = data.rows;
		      if(rows.length > 0){
			  for(var x = 0; x < rows.length; x++){
			      _self.db.remove('thing',rows[x].id).done();
			  }
			  _self.lsSet('metadea', rows[rows.length -1].key);
		      }
		      if(typeof callback == 'function')
			  callback();			  
		      setTimeout(function(){_self.getSubscribed();},500);
		  });
    },
    
    fetchMetaData: function(callback){
	var _self = this;
	_self.debug >= 2 && console.log('fetchMetaData');
	var metaSeq = parseInt(_self.lsGet('metaseq')) || 0;
	_self.getJSON(_self.metaUrl,
		  { include_docs: true,
		    startkey: metaSeq,
		    //rando: Math.random() // remove me, pierces cache 
		  },		  
		  function(data){
		      var rows = data.rows;
		      if(rows.length > 0){
			  var insert = rows.map( function(x){ return x.doc; } );
			  var req = _self.db.put('thing',insert);
			  req.done(
		    	      function(){
		    		  _self.lsSet('metaseq', rows[rows.length -1].key + 1);
		    		  _self.fetchMetaDeactivated(callback);
		    	      }
			  );
			  req.fail(function(e) {
		    	      // there was a insert problem 
		    	      console.error('fetchMetaData',e);
			  });
		      } else {
			  _self.fetchMetaDeactivated(callback);
	    	      }		      
	    });
    },
    
    fetchCampaignDeactivated: function(campaign){
	var _self = this;
	_self.debug && console.log("fetchCampaignDeactivated");
	var campDeact = parseInt(_self.lsGet('dea' + campaign)) || parseInt(_self.lsGet('seq' + campaign)) || 0;
	_self.getJSON(_self.deactivateUrl, 
		      {startkey: JSON.stringify([ campaign, campDeact ]),
		       endkey: JSON.stringify([ campaign, {} ]),
		       //rando: Math.random() // remove me, pierces cache
		      } ,
		      function(data){
			  var rows = data.rows, req;
			  if(rows.length > 0){
			      for(var x = 0; x < rows.length; x++){
				  req = _self.db.remove('thing',rows[x].id);
				  req.fail(function(x){
				      _self.debug >= 4 && console.log('fetchCampaignDeactivated fail',x)});
				  req.done(function(x){
				      _self.debug >= 3 && console.log('fetchCampaignDeactivated succeed',x)});
			      }
			      _self.lsSet('dea' + campaign, rows[rows.length -1].key[1] + 1);
			  }});		  
    },

    fetchCampaignData: function(campaign){
	var _self = this;
	var campSeq = parseInt(_self.lsGet('seq' + campaign)) || 0;
	_self.getJSON(_self.dataUrl, 
		      {include_docs: true,
		       startkey: JSON.stringify([ campaign, campSeq ]),
		       endkey: JSON.stringify([ campaign, {} ]),
		       //rando: Math.random() // remove me, pierces cache
		      } ,
		      function(data){
			  var rows = data.rows;
			  if(rows.length > 0){
			      var insert = rows.map( function(x){ return x.doc } );
		      	      req = _self.db.put('thing',insert);
		      	      req.done(
				  function(){
		      		      _self.lsSet('seq' + campaign, rows[rows.length -1].key[1] + 1);
		      		      _self.fetchCampaignDeactivated(campaign);
				  }
		      	      );
		      	      req.fail(function(e,x) {
		      		  // there was a insert problem 
		      		  console.error('fetchCampaignData fail',campaign,x);
		      	      });
			  } else {
		      	      _self.fetchCampaignDeactivated(campaign);
			  }});
    },
    
    sync: function(){	
	var _self = this;
	_self.debug && console.log('sync',_self.campaigns);
	_self.fetchMetaData();
	for(var x = 0; x < _self.campaigns.length; x++){
	    _self.debug >= 2 && console.log('sync camp',_self.campaigns[x]);
	    _self.fetchCampaignData(_self.campaigns[x])
	}
	_self.lsSet('lastSyncTime', (new Date).toJSON());	
    },
    
    lookup: function(handle,request,callback){
	var _self = this;
	var req ;
	var campaign, hmatch;
	_self.debug && console.log('lookup',handle);
	if(request.handle.match(/^domain:/)){
	    req = _self.db.from('thing').where('handles','^',handle.split('/')[0]);
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
	    req = _self.db.from('thing').where('handles','=',handle);
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
	_self.debug && console.log('resultsPrep',request.handle);
	callback(request);
    },

    getOptions: function(){
	var _self = this;
	_self.popd = _self.lsGet('opt_popD');
    },
    
    sendNotification: function(id,title,message){
	this.debug && console.log('sendNotification',title,message);
	var n = new Notifications(
				  title,
{body: message}
				  );
	n.onclick = openOptions;
    },
    
    getNotifications: function(){
	var _self = this;
	var lnt = new Date(_self.lsGet('lastnotifytime')||0);
	var now = new Date;
	if(lnt){
	    if(now - lnt > 7 * 24 * 3600 * 1000){  // one week
		_self.checkOldVersion();
		_self.db.from('thing').where('type','=','notification').list(1000).done(
		    function(results){
			var result;
			//console.log('notification results',results);
			for(var i in results){
			    result = results[i];
			    if(result.notification_date >= lnt.toJSON()){
				_self.sendNotification(result._id,result.title,result.text);
			    }
			}
			_self.lsSet('lastnotifytime',now.toJSON());
		    }
		);
	    }
	} else {	
	    _self.lsSet('lastnotifytime',now);
	}
    },
    
    checkOldVersion: function(){	
	var _self = this, vt =_self.getVersionTime(), now = new Date, currentVersion = '1'; //chrome.runtime.getManifest().version;
	if(vt && now - vt > (1000 * 3600 * 24 * 30)){
	    // its been a month so lets check    
	    _self.getJSON(_self.versionURL,
			  function(results){
			      var results = response.json;
			      if(results.releaseDate - vt > 1000 * 3600 * 24 * 14 && results.version != currentVersion){
				  _self.sendNotification(1,"New Version Available","A new version is available and the one installed is more than 2 weeks out of date");
			      }});
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
    
    initialCamps: function(){
	var _self = this;
	_self.debug && console.log("initialCamps");
	if(_self.lsGet('campaigns')) // there's existing config so return
	    return;

	var newCamps = ['congress','climatecounts','effback','politifact','naacp','whoprofits','ciw', 'johnoliver'];
	[ 'opt_rush','opt_hotel','opt_bechdel', 'opt_bcorp', 'opt_roc','opt_hrc' ].forEach(
	    function(o){
		if(_self.lsGet(o) != 0){
		    newCamps.push(o.replace('opt_',''));
		}
		_self.lsRm(o);
	    });
	_self.lsSet('campaigns', JSON.stringify(newCamps));    
	_self.getSubscribed();
    },
    lsSet: function(x,y){
	localStorage[x] = y;
    },
    lsGet: function(x){
	return localStorage[x];
    },
    lsRm: function(x){
	localStorage.removeItem(x);
    },
    setVersionTime: function(){
	var _self = this, d = new Date;
	_self.lsSet('versionTime', d.toJSON());
    },
    getVersionTime: function(){
	var _self = this, j, ret = null;
	j = _self.lsGet('versionTime');
	if(j)
	    ret = new Date(j);
	return ret;
    },
    getJSON: $.getJSON,
    get: $.get
}

var tc = new Ext();

// browser specific
function onRequest(e){
    var request = e.message;
    var callback = function(r){ e.target.page.dispatchMessage(r.kind,r)};
    
    if(request.kind == 'pageA'){
	// chrome.pageAction.setIcon({tabId:sender.tab.id,path:request.icon});
	// chrome.pageAction.show(sender.tab.id);
    } else if(request.kind == 'sendstat' && !sender.tab.incognito){
	tc.sendStat(request.key);
    } else if(request.handle){
	tc.lookup(request.handle,request,callback);
    } else if(request == 'sendOptions'){
	tc.sendOptions(
	    function(r){
		e.target.page.dispatchMessage('sendOptions',r);
	    }
	);
    } else if(request.kind == 'saveOptions'){
	tc.saveOptions(request);
    } else {
	console.log("couldn't get a handle",request);
    }   
}

safari.application.addEventListener("message",onRequest);

function optionsChange(message){
    if(message.reResults == 1){
	tc.removeLocalTableVersion('results');
    }
    if(message.rePlace){
	tc.removeLocalTableVersion('place');
	tc.removeLocalTableVersion('place_data');	    
    }
    for(var i in checkOpts){
	localStorage[checkOpts[i]] = message.opts[checkOpts[i]];
    }
    localStorage['opt_popD'] = message.opts['opt_popD'];

    tc.loadAllTables();
}

function restoreOptions(callback){
    var opts = {};
    for(var i in checkOpts){
	opts[checkOpts[i]] = localStorage[checkOpts[i]];
    }
    opts['opt_popD'] = localStorage['opt_popD'];
    callback({kind: 'restoreOptions',opts:opts});
}

function openOptions(){
    var t = safari.application.activeBrowserWindow.openTab('foreground');
    t.url = safari.extension.baseURI + "options.html";
}
function openUpdate(){
    var t = safari.application.activeBrowserWindow.openTab('foreground');
    t.url = safari.extension.baseURI + "options.html?update";
}
function openInstall(){
    var t = safari.application.activeBrowserWindow.openTab('foreground');
    t.url = safari.extension.baseURI + "options.html?install";
}

safari.extension.settings.addEventListener("change", openOptions, false);

