// ==UserScript==
// @name bing-search.js
// @include http://*.bing.com/*
// @include https://*.bing.com/*
// @require jquery-1.10.2.min.js
// @require jquery-ui-1.9.2.custom.min.js
// @require jquery-ui.css.js
// @require ejs_production.js
// @require utils.js
// ==/UserScript==

console.log('bing-search');

tc.registerResponse('domain',
		    function(data){
			var sid = data.request.sid;
			$("[sid=" + sid +"]").map(function(){
			    tc.resultPrev(this,data);});
		    });

// result link
$('ol#b_results li.b_algo h2 a').map(
    function(){
	var sid = "gs" + tc.random();
	this.setAttribute("sid",sid);
	tc.sendMessage({kind: 'domain'
			,source: 'bing-search'
     			, sid: sid
     			, key: tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'') });

    }
);

// ads
$('ol#b_results li.b_ad div.sb_add:has(h2 > a) div.b_caption > div.b_attribution > cite').map(
    function(){
	var mlink = this.parentElement.parentElement.parentElement.children[0].children[0];
	var sid = "gs" + tc.random();
	mlink.setAttribute("sid",sid);
	tc.sendMessage({kind: 'domain'
			,source: 'bing-search'
     			, sid: sid
     			, key: tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });

    }
);

