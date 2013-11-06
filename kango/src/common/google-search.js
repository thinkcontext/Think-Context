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


	function pageExamine(){
	    //console.log("pageExamine");
	    tc.googleSearch.examineResults();
	    //tc.reverseExamine();
	}

	pageExamine();
	window.setInterval(pageExamine,500);
    }

    ,  examineResults: function(){

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
