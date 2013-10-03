// ==UserScript==
// @name reverse.js
// @include *.adsonar.com/*
// @include *.msn.com/*
// @include ad.doubleclick.net/adi*
// @include *doubleclick.net/pagead*
// @include *.overture.com/*
// @all-frames true
// @require jquery-1.10.2.min.js
// @require utils.js
// ==/UserScript==
if (window.frameElement !== null){
console.log("iframe");
console.log(document.domain);
tc.iframe = {};
tc.iframe.sendReq = function(j){
    var sid = "gs" + tc.random();
    j.setAttribute("sid",sid);
    tc.sendMessage({'kind': 'domain'
     		    , 'sid': sid
     		    , 'key': tc.sigURL(j.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });
    
};

if(document.domain.match('adsonar.com')){
    $("p.lnk a").not('a[sid]').map(
	function(){
	    console.log("adsonar: " + this.textContent);
	    tc.iframe.sendReq(this);
	});
} else if(document.domain.match('msn.com')){
    $('a.AdDisplayUrl').not('a[sid]').map(
	function(){
	    console.log("msn: " + this.textContent);
	    tc.iframe.sendReq(this);
	});
} else if(document.baseURI.match('ad.doubleclick.net/adi')){
    $("object param[value*='adurl%3D']").map(
	function(){
	    console.log(this.value);
	    var m = this.value.match(/sscs%253D%253fhttp(s)?%3A\/\/([^\/]+)/);
	    if(m && m.length == 3){
		console.log('doubleclick param ' + m[2])
	    } else {
		m = this.value.match(/adurl%3Dhttp(s)?%253a%252f%252f([^\/]+)\//)
		if(m && m.length == 3){
		console.log('doubleclick param ' + m[2])
		}
	    }
	});
} else if(document.baseURI.match('doubleclick.net/pagead')){
    $("span.adus").not('a[sid]').map(
	function(){
	    console.log("doubleclick pagead: " + this.textContent);
	    tc.iframe.sendReq(this);
	});
} else if(document.domain.match('overture.com')){
    $("div.clsURL").not('a[sid]').map(
	function(){
	    console.log("overture: " + this.textContent);
	    tc.iframe.sendReq(this);
	});
}
}
