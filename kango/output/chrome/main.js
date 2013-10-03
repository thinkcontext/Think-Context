function Store(name){
    this.name = name;
    // check if already exists, if not create
    // and version is correct, if not, delete all old keys, re-init
    // check last update time, update if necessary
}
Store.prototype = {

    setItem: function(key,val){
	kango.storage.setItem(this.name + '-' + key,val);
    },

    getItem: function(key){
	return kango.storage.getItem(this.name + '-' + key);
    },
    removeItem: function(key){
	return kango.storage.removeItem(this.name + '-' + key);
    }
}

function MyExtension() {
    var self = this; // why is this here?
    // TODO check first run, update, outdated
    this.urlPrefix = 'http://localhost:5984/domain/_design/think/_view';

    this.campaigns = ['rushBoycott','bcorp']; // make this a setting
    this.verbs = {}; // preload templates, store as single document
    this.loadVerbs();

    this.domain = new Store('domain');

    this.load();

    // open for business, listen for requests
    kango.addMessageListener('content2background'
			     , function(event){
				 var data = event.data, reply;
				 console.log(event);
				 console.log(data);
				 switch(data.kind){
				 case 'domain':
				     reply = self.lookupDomain(data);
				     console.log(reply);
				     if(reply)
					 event.target.dispatchMessage('background2content',reply);
				     break;
				 }
			     });
 
    kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
	self._onCommand();
    });
}

MyExtension.prototype = {
    _onCommand: function(){ console.log('foo');},
    loadVerbs: function(){
//	this.verbs = kango.storage.getItem('verbs').verbs;
    },

    load: function(){
	var self = this;
	console.log('load');
	$.getJSON(this.urlPrefix + '/loadByCampaign'
		  ,function(data){
		      var k, rows = data.rows;
		      if(rows.length > 0){
			  kango.storage.clear(); // only clear if there's data
			  var maxTime = '2000-01-01 01:01:01 -0400';
			  for(var k in rows){
			      kango.storage.setItem(rows[k].id,rows[k].value);
			      if(rows[k].value.date_added > maxTime)
				  maxTime = rows[k].value.date_added;
			  }
			  kango.storage.setItem('metaTime',maxTime);
			  self.loadVerbs();
		      }
		  });
    },
    update: function(){
	var d = new Date, self = this;
	$.getJSON(this.urlPrefix + '/updatebycampaign?startkey="' + kango.storage.getItem('metaTime') + '"&endkey="'+ d.toJSON()+'"'
		  ,function(data){
		      var k, rows = data.rows, key;
		      var maxTime = kango.storage.getItem('metaTime');
		      for(var k in rows){
			  key = rows[k].id
			  switch(rows[k].value.status = 'D'){
			  case 'D':
			      kango.storage.removeItem(key);
			      break;
			  case 'A':
			      kango.storage.setItem(key,rows[k].value);
			      break;
			  default:
			      continue;
			  }
			  if(rows[k].value.date_modified > maxTime)
			      maxTime = rows[k].value.date_modified;
		      }
		      kango.storage.setItem('metaTime',maxTime);
		      self.loadVerbs();		      
		  });
    },
    lookupDomain: function(rdata){
	console.log(rdata);
	var d = this.getDomain(rdata.key);
	console.log(d);
	if(d){
	    return this.domain.getItem(d);
	}
    },
    getDomain: function(d){
	var m = d.match(/^(www\.)?([^\/]+\.[^\/]+)/);
	console.log(d,m);
	if(m.length == 3){
	   return m[2];
	}
    }
    
};

var extension = new MyExtension();
