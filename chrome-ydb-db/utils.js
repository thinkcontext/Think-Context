var tc = {};
tc.handleSeperator = ':';
tc.onResponse = function(request){
    console.log('onResponse',request);
}
tc.sendMessage = function(request){
    console.log('sendMessage',request);
    chrome.extension.sendRequest(request, tc.onResponse);
}

tc.urlHandle = function(url){
    //    console.log('urlHandle',url);
    url = url.trim();
    if(!url.match('^https?://\w'))
	return null;
    this.url = url;
    var m, sp = url.split('/');
    var domain = sp[2].toLowerCase().replace(/^www\./,'');
    var path = sp.slice(3).join('/');
    this.domain = domain;
    this.path = path;
    
    if(domain == 'twitter.com' && (m = path.match('^(\w+)'))){
	this.kind = 'twitter';
	this.hval = m[1].toLowerCase();
    } else if(domain == 'tripadvisor.com' && (m = path.match('_Review-(g[0-9]+-d[0-9]+)'))){
	this.kind = 'tripadvisor';
	this.hval = m[1];
    } else if(domain == 'facebook.com' && ((m = path.match('pages.*/([0-9]{5,20})')) || (m = path.match('^([^\?/\#]+)')))){
	this.kind = 'facebook';
	this.hval = m[1];
    } else if(domain == 'yelp.com' && (m = path.match(/biz\/([\w\-]+)/))){
	this.kind = 'yelp';
	this.hval = m[1];
    } else if(domain == 'hotels.com' && (m = path.match('ho([0-9]+)'))){
	this.kind = 'hcom';
	this.hval = m[1];
    } else if(domain == 'orbitz.com' && (m = path.match('(h[0-9]+)'))){
	this.kind = 'orbitz';
	this.hval = m[1];
    } else if(domain == 'expedia.com' && (m = path.match('(h[0-9]+)'))){
	this.kind = 'expedia';
	this.hval = m[1];
    } else if(domain == 'kayak.com' && (m = path.match('([0-9]+).ksp'))){
	this.kind = 'kayak';
	this.hval = m[1];
    } else if(domain == 'priceline.com' && (m = path.match('-([0-9]{5,10})-'))){
	this.kind = 'priceline';
	this.hval = m[1];
    } else if(domain == 'imdb.com' && (m = path.match('title/(tt[0-9]+)'))){
	this.kind = 'imdb';
	this.hval = m[1];
    } else if(domain == 'plus.google.com' && ((m = path.match('^([0-9]+)')) || (m = path.match('(\+\w+)')))){
	this.kind = 'gplus';
	this.hval = m[1];
    } else {
	this.kind = 'domain';
	this.hval = domain + '/' + path;
    }
	      
    if(this.kind && this.hval)
	this.handle = this.kind + tc.handleSeperator + this.hval;
}

tc.popSend = function(){
    var url = document.baseURI;
    $("link[rel='canonical']").map(
	function(){ 
	    if(this.href)
		url = this.href;
	});
    console.log(url);
    var h = new tc.urlHandle(url);
    if(h){
	tc.sendMessage({
	    kind: h.kind
	    , handle: h.handle
	    , pop: 1
	});	    
    }	
}

tc.simpleHandleExamine = function(selector){
    $(selector).not('[tcid],img,div').map(
	function(){
	    var h = new tc.urlHandle(this.href);
	    if(h){
		var r = tc.random();
		this.tcid = r;
		tc.sendMessage({
		    kind: h.kind
		    , tcid: r
		    , handle: h.handle});
	    }
	});
}

tc.uniqueArray = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};
tc.random = function(){return Math.floor(Math.random() * 100000);}
