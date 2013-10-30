// ==UserScript==
// @name reverse.js
// @exclude http://*.google.com/*
// @exclude https://*.google.com/*
// @exclude http://*.bing.com/*
// @exclude https://*.bing.com/*
// @exclude http://search.yahoo.com/*
// @exclude https://search.yahoo.com/*
// @exclude http://*.goodsearch.com/*
// @exclude https://*.goodsearch.com/*
// @exclude *.adsonar.com/*
// @exclude *.msn.com/*
// @exclude ad.doubleclick.net/adi*
// @exclude *doubleclick.net/pagead*
// @exclude *.overture.com/*
// @include http://*
// @include https://*
// @require jquery-1.10.2.min.js
// @require jquery-ui-1.9.2.custom.min.js
// @require jquery-ui.css.js
// @require ejs_production.js
// @require utils.js
// ==/UserScript==
console.log('reverse');

if(! document.domain.match('google.com$') || document.domain == 'news.google.com'){
    tc.reverse = {};
    tc.reverse.revGotResponse = 0;
    tc.registerResponse('domain', function(data) {
        // event.data - the data sent with message
        console.log('Background script says: ');
	console.log(data);
	if(data.request.pop == 1){
	    tc.resultPop(data);
	} else {
	    var sid = data.request.sid;
	    $("[sid=" + sid +"]").map(function(){
		tc.resultPrev(this,data);});
	}
    });

    tc.sendMessage(
	{kind: 'domain'
	 , source: 'reverse'
	 , pop: 1
	 , key: tc.sigURL(document.baseURI).replace(/https?:\/\//,'').replace(/\/$/,'')
	});
	
    $("link[rel='canonical']")
	.map(function(){
	    if(tc.sigURL(document.baseURI) != tc.sigURL(this.href)){
		tc.sendMessage(
		    {kind: 'domain'
		     , source: 'reverse'
		     , key: tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'')
		     , pop: 1
		    });
	    }});


    $("a[href*='googleadservices.com/pagead/aclk']").not('a[sid]').map(
	function(){
	    console.log(this);
	    if(!this.textContent.match(' ')){
	    	console.log(this.textContent);
	    	var sid = "gs" + tc.random();
	    	this.setAttribute("sid",sid);
	    	tc.sendMessage(
	    	    {kind: 'domain'
		     , source: 'reverse'
     	    	     , sid: sid
     	    	     , key: tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });
	    }
	});

    $("a[href*='shlinks.industrybrains.com']").not('a[sid]').map(
	function(){
	    if(!this.textContent.match(' ')){
		console.log('industrybrains: ' + this.textContent);
		var sid = "gs" + tc.random();
		this.setAttribute("sid",sid);
		tc.sendMessage({kind: 'domain'
				, source: 'reverse'
     				, sid: sid
     				, key: tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });
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
