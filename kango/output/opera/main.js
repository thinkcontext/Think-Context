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
    },

    deleteKeys: function(){
	var r = RegExp('^' + this.name + '-')
	for(var k in kango.storage.getKeys){
	    if(r.test(k)){
		kango.storage.removeItem(k);
	    }
	}
    },
}


function MyExtension() {
    var self = this; // why is this here?
    // check first run, update, outdated
    this.urlPrefix = 'http://localhost:5984/domain/_design/think/_view';

    this.campaigns = ['stoprush','bcorp']; // make this a setting
    this.templates = {}; // preload templates, store as single document

    this.domain = new Store('domain');

    this.load();

    // open for business, listen for requests
    kango.addMessageListener('content2background'
			     , function(event){
				 var data = event.data;
				 console.log(data);
				 switch(data.kind){
				 case 'domain':
				     console.log(self.lookupDomain(data));
				     break;
				 }
			     });
 
    kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
	self._onCommand();
    });
    
    
}

MyExtension.prototype = {
    _onCommand: function(){ console.log('foo');},

    load: function(){
	var domain = this.domain;
	console.log('load');
	$.getJSON(this.urlPrefix + '/load'
		  ,function(data){
		      console.log(domain);		      
		      var k, rows = data.rows;
		      if(rows.length > 0){
			  kango.storage.clear(); // only clear if there's data
			  var maxTime = '2000-01-01 01:01:01 -0400';
			  for(var k in rows){
			      domain.setItem(rows[k].key,rows[k].value);
			      if(rows[k].value.date_added > maxTime)
				  maxTime = rows[k].value.date_added;
			  }
			  kango.storage.setItem('metaTime',maxTime);
		      }
		  });	
    },
    update: function(){
	var d = new Date;
	var domain = this.domain;
	$.getJSON(this.urlPrefix + '/update?startkey="' + kango.storage.getItem('metaTime') + '"&endkey="'+ d.toJSON()+'"'
		  ,function(data){
		      var k, rows = data.rows, key;
		      var maxTime = kango.storage.getItem('metaTime');
		      for(var k in rows){
			  key = rows[k].key.split('-')[0]
			  switch(rows[k].value.status = 'D'){
			  case 'D':
			      domain.removeItem(key);
			      break;
			  case 'A':
			      domain.setItem(key,rows[k].value);
			      break;
			  default:
			      continue;
			  }
			  if(rows[k].value.date_modified > maxTime)
			      maxTime = rows[k].value.date_modified;
		      }
		      kango.storage.setItem('metaTime',maxTime);
		  });
    },
    lookupDomain: function(rdata){
	console.log(rdata);
	var d = this.getDomain(rdata.key);
	if(d){
	    return this.domain.getItem(d);
	}
    },
    getDomain: function(d){
	var m;
	if(m = d.match(/^[^\/]+\.[^\/]+/)){
	   return m[0];
	}
    }
    
};

var extension = new MyExtension();
