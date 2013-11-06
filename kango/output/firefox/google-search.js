// ==UserScript==
// @name google-search.js
// @include http://*.google.com/*
// @include https://*.google.com/*
// @require jquery-1.10.2.min.js
// @require jquery-ui-1.9.2.custom.min.js
// @require jquery-ui.css.js
// @require ejs_production.js
// @require utils.js
// ==/UserScript==
console.log('google-search');

tc.googleSearch = {

    doit: function(){
    
	tc.registerResponse('domain', function(data){
	    console.log('domain listener');
	    var sid = data.request.sid;
	    $("[sid=" + sid +"]").map(function(){
		tc.resultPrev(this,data);});
	});

	tc.googlePlacesHandler = function(siteid, icon,ra ,title ,blurb){
	    $("li#lclbox  div.vsc:has( div > div > a[href *= 'plus.google.com/" + siteid +"']) div > h4 > a").map(function(){
		tc.insertPrev(this,icon,ra,title,blurb);});	    
	}

	tc.registerResponse('places', tc.googlePlaces);

	tc.registerResponse('place', function(request){
	    console.log('place listen');
	    switch(request.subtype){
	    case 'gs-cid':
		$("div:has([sid=" + request.sid +"]) > h4 > a").map(function(){
		    tc.place(this,request.key,request.data);});
		break;
	    case 'gs-ptable':
		$("div:has([sid=" + request.sid +"]) > h3 > a").map(function(){
		    tc.place(this,request.key,request.data);
		});
		break;
	    case 'gs-lcll':
		$("[sid=" + request.sid +"]").map(function(){
		    tc.place(this,request.key,request.data);});
		break;
	    }
	});

	function pageExamine(){
	    //console.log("pageExamine");
	    tc.googleSearch.examineResults();
	    //tc.reverseExamine();
	}

	pageExamine();
	window.setInterval(pageExamine,500);
    }

    ,  examineResults: function(){
	// place page in an lclbox brief results
	// eg "westin dc"
	var urlmap = $("li#lclbox  div.vsc > div > div > a[href *= 'plus.google.com']").not('[tcPlace]').map(
	    function(){
		this.setAttribute('tcPlace','tcPlace');
    		if(this.parentNode.children[0] && this.parentNode.children[0].getAttribute && !this.parentNode.children[0].getAttribute('subv')){
		    var cid_regex = new RegExp('plus.google.com/([0-9]+)');
    		    cid_res = cid_regex.exec(this.href);
		    if(cid_res[1]){
			var cid = cid_res[1];
			var sid = "gs" + tc.random();
			this.parentNode.children[0].setAttribute("sid",sid);
			tc.sendMessage({kind: 'googleplus'
					, source: 'google-search'
					, subtype: 'gs-cid'
					, key: cid
				       });
		    }
		}
	    }
	);
	
	// place page in an lclbox long result
	// eg "hay adams hotel"
	$("li:has(div > h3 > a) > div > div > #lclbox > a[href*='plus.google.com']:first").not('[tcPlace]').map(
	    function(){
		this.setAttribute('tcPlace','tcPlace');
		var target = this.parentNode.parentNode.parentNode.children[0].children[0];
    		if(target && target.getAttribute && !target.getAttribute('subv')){
		    var cid_regex = new RegExp('plus.google.com/([0-9]+)');
    		    cid_res = cid_regex.exec(this.href);
		    if(cid_res[1]){
			var cid = cid_res[1];
			var sid = "gs" + tc.random();
			target.setAttribute("sid",sid);
			tc.sendMessage({kind: 'googleplus'
					, source: 'google-search'
					, subtype: 'gs-lcll'
					, sid: sid
					, key: cid  });
		    }
		}
	    }
	);
	
	// place not in an lclbox
	// boston hotels
	$("div.intrlu > div > span > a[href*='//plus.google.com/']").not('[tcPlace]').map(
	    function(){
		this.setAttribute('tcPlace','tcPlace');
		var cid_regex = new RegExp('plus.google.com/([0-9]+)');
    		cid_res = cid_regex.exec(this.href);
		if(cid_res[1]){
		    var cid = cid_res[1];
		    var sid = "gs" + tc.random();
		    this.setAttribute("sid",sid);
		    tc.sendMessage({kind: 'googleplus'
				    , source: 'google-search'
				    , subtype: 'gs-ptable'
				    , sid: sid
				    , key: cid  });
		}
	    }
	);

	var linkExam = function(){
	    this.setAttribute('tcLink','tcLink');
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    tc.sendMessage({kind: 'domain'
			    , source: 'google-search'
     			    , sid: sid
     			    , key: tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'') });		
	};

//     ad links

	$('div#tvcap h3 a#vpa1, a#vpa2, a#vpa3, a#vpa4').not('[tcLink]').map(linkExam);	
	$("div#mbEnd a#van1, a#van2, a#van3, a#van4, a#van5, a#van6").not('[tcLink]').map(linkExam);		
	$("div#bottomads a#vpab1, a#vpab2, a#vpab3, a#vpab4").not('[tcLink]').map(linkExam);

//	result link	
	$("ol#rso > li.g > div > h3 > a").not('[tcLink]').map(linkExam);

    }
}

if(document.location.href.search('.*www.google.com/search\?.*') >= 0
   ||document.location.href.search('.*www.google.com/webhp') >= 0
   ||document.location.href.search('.*www.google.com/#') >= 0
   ||($('div#center_col').length == 0 && document.location.hostname == 'www.google.com' && document.location.pathname == '/')
  ){
    tc.googleSearch.doit();
}
