// ==UserScript==
// @name reverse.js
// @include http://*
// @include https://*
// @require jquery-1.10.2.min.js
// @require utils.js
// ==/UserScript==
console.log('reverse');
//kango.dispatchMessage('content2background','foo');
if(! document.domain.match('google.com$') || document.domain == 'news.google.com'){
    console.log('here');
    $("a[href*='googleadservices.com/pagead/aclk']").not('a[sid]').map(
	function(){
	    console.log(this);
	    if(!this.textContent.match(' ')){
	    	console.log(this.textContent);
	    	var sid = "gs" + tc.random();
	    	this.setAttribute("sid",sid);
	    	tc.sendMessage(
	    	    {'kind': 'domain'
     	    	     , 'sid': sid
     	    	     , 'key': tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });
	    }
	});

    $("a[href*='shlinks.industrybrains.com']").not('a[sid]').map(
	function(){
	    if(!this.textContent.match(' ')){
		console.log('industrybrains: ' + this.textContent);
		var sid = "gs" + tc.random();
		this.setAttribute("sid",sid);
		tc.sendMessage({'kind': 'domain'
     				, 'sid': sid
     				, 'key': tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });
		}
	});


    $("object param[value*='adurl%3Dhttp%253A%252F%252Fad.doubleclick.net/click']").map(
	function(){
	    var m = this.value.match(/sscs%253D%253fhttp(s)?%3A\/\/([^\/]+)/);
	    if(m && m.length == 3)
		console.log('doubleclick param ' + m[2])
	});

    $("object[flashvars*='click=http%3A%2F%2Fad.doubleclick.net']").map(
	function(){
	    var m = this.attributes.flashvars.textContent.match(/exitEvents=[^\&]*url%253Ahttp%25253A%2F%2F([^\%]+)/);
	    if(m && m.length == 2)
		console.log('doubleclick object ' + m[1]);
	});

}