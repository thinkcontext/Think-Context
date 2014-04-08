if(window.top === window && (document.location.host == 'www.google.com' || document.location.host == 'maps.google.com')) {
tc.googleSearch = {};
    var	$observerSummaryRoot = $("body");

if(document.location.href.search('.*www.google.com/search\?.*') >= 0
   ||document.location.href.search('.*www.google.com/webhp') >= 0
   ||document.location.href.search('.*www.google.com/#') >= 0
   ||($('div#center_col').length == 0 && document.location.hostname == 'www.google.com' && document.location.pathname == '/')
  ){
    tc.googleSearch.observe = function(){
	$observerSummaryRoot.mutationSummary("connect"
					     , tc.googleSearch.summaryCallback
					     , [{ element:'div' }]);
    }
    tc.googleSearch.doit = function(){
	//     ad links
	tc.searchLinkExam('li.ads-ad:has(h3) div.ads-visurl cite'
			  ,'google-search'
			  , function(x){return x.parentElement.children[0]}
			  , function(x){ return x.textContent});
	
	//	result link	
	tc.searchLinkExam("ol#rso li.g div > h3 > a",'google-search');
    }
}else if((document.location.hostname == 'www.google.com' && document.location.pathname.search('/maps') == 0) || document.location.hostname == 'maps.google.com'){

    if(document.location.search.search('output=classic') >= 0){
	// classic maps interface

	tc.googleSearch.observe = function(){
	    $observerSummaryRoot.mutationSummary("connect"
						 , tc.googleSearch.summaryCallback
						 , [{ element: 'div' }]);
	}
	
	tc.googleSearch.doit = function(){
	    // sidebar
	    tc.searchLinkExam("div.one span.pp-headline-authority-page"
			      , 'google-search'
			      , function(x){
				  var ret;
				  var z = x.parentElement.parentElement.parentElement.parentElement;
				  if(z.classList.contains("one")){
				      $("div.lname",z).map(
					  function(){ 
					      ret = this; 
					  });
				  }
				  return ret;
			      }
			      , function(x){return x.textContent});	
	    
	    // in map popup dialogs
	    
	    tc.searchLinkExam("div.gmnoprint td.basicinfo div#iwhomepage a"
			      , 'google-search'
			      , null
			      , function(x){return x.textContent});	    
	}
	
    } else {

	// new maps interface

	$observerSummaryRoot = $("div#cards");
	tc.googleSearch.observe = function(){
	    $observerSummaryRoot.mutationSummary("connect"
						 , tc.googleSearch.summaryCallback
						 , [{ element: 'div.cards-entity-url' }]);
	}
	tc.googleSearch.doit = function(){
	    tc.searchLinkExam("div.cards-entity-url a"
			      , 'google-search'
			      , function(x){
				  var ret;
				  var z = x.parentElement.parentElement.parentElement.parentElement;
				  if(z.classList.contains("cards-entity")){
				      $("h1.cards-entity-title",z).map(
					  function(){ 
					      ret = this; 
					  });
				  }
				  return ret;
			      }
			      , function(x){return x.textContent});		
	}
	
    }
}

tc.googleSearch.summaryCallback = function(summaries){
//    tc.googleSearch.doit();
    $observerSummaryRoot.mutationSummary("disconnect");
    tc.googleSearch.doOb();
}

tc.googleSearch.doOb = function(){
    tc.googleSearch.doit();
    window.setTimeout(tc.googleSearch.doit,1000);    
    window.setTimeout(tc.googleSearch.observe,500);
}

tc.googleSearch.doOb();
    safari.self.addEventListener("message",tc.onResponse, false);
}
