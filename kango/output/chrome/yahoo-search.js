// ==UserScript==
// @name yahoo-search.js
// @include http://*.search.yahoo.com/*
// @include https://*.search.yahoo.com/*
// @include http://search.yahoo.com/*
// @include https://search.yahoo.com/*
// goodsearch needs all-frames, puts yahoo in an iframe
// @all-frames true
// @require jquery-1.10.2.min.js
// @require jquery-ui-1.9.2.custom.min.js
// @require jquery-ui.css.js
// @require ejs_production.js
// @require utils.js
// ==/UserScript==

console.log('yahoo-search');

// result link - could be a place link else look up the result link
$('div#web > ol h3 > a').map(
    function(){
    	if(!this.previousSibling || !this.previousSibling.getAttribute || !this.previousSibling.getAttribute('subv')){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    var yid_regex = new RegExp('local.yahoo.com/info-([0-9]+)');
    	    yid_res = yid_regex.exec(this.href);
	    if(yid_res && yid_res[1]){
		var yid = yid_res[1];
		tc.sendMessage({kind: 'place'
				, sid: sid
				, type: 'yahoo'
				, key: yid  });
	    } else {
		this.setAttribute("sid",sid);
		tc.sendMessage({kind: 'domain'
				, source: 'yahoo-search'
     				, sid: sid
     				, key: tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'') });
	    }
	}
    });

// ads

$('div.ads ul.spns li.sitelink:has(div > a) > em > a').map(function(){
    console.log(this);

    var ylink = this.parentElement.children[0].children[0];
    console.log(ylink);
    var sid = "gs" + tc.random();
    ylink.setAttribute("sid",sid);
    tc.sendMessage({kind: 'domain'
		    ,source: 'yahoo-search'
     		    , sid: sid
     		    , key: tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });
    
});
