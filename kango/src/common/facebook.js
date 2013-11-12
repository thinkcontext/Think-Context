// ==UserScript==
// @name facebook.js
// @include http://*.facebook.com/*
// @include https://*.facebook.com/*
// @require jquery-1.10.2.min.js
// @require jquery-ui-1.9.2.custom.min.js
// @require jquery-ui.css.js
// @require ejs_production.js
// @require utils.js
// ==/UserScript==
console.log('facebook');
tc.facebook = {};

tc.registerResponse('domain', function(request){
    var sid = data.request.sid;
    $("[sid=" + sid +"]").map(function(){
	tc.resultPrev(this,data);});
});

tc.facebook.examine = function(){
    var urlmap;

    $('div.adInfo a').not('a[sid]').map(
	function(){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    tc.sendMessage({kind: 'domain'
			    , source: 'facebook'
     			    , sid: sid
     			    , key: tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'').toLowerCase() });
	    
	});}

tc.facebook.examine();
setInterval(tc.facebook.examine, 1000);
