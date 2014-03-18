if(window.top === window) {
    tc.googleSearch = {};
    var $observerSummaryRoot

    if(document.location.href.search('.*www.google.com/search\?.*') >= 0
       ||document.location.href.search('.*www.google.com/webhp') >= 0
       ||document.location.href.search('.*www.google.com/#') >= 0
       ||($('div#center_col').length == 0 && document.location.hostname == 'www.google.com' && document.location.pathname == '/')
      ){
	$observerSummaryRoot = $("div#rcnt");    
	tc.googleSearch.observe = function(){
	    $observerSummaryRoot.mutationSummary("connect"
						 , summaryCallback
						 , [{ characterData:true }]);
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
    }else if(document.location.hostname == 'www.google.com' && document.location.pathname.search('/maps/') == 0){
	// this is the new google maps interface

	$observerSummaryRoot = $("div#cards");
	tc.googleSearch.observe = function(){
	    $observerSummaryRoot.mutationSummary("connect"
						 , summaryCallback
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


    function summaryCallback(summaries){
	//    tc.googleSearch.doit();
	$observerSummaryRoot.mutationSummary("disconnect");
	doOb();
    }

    function doOb(){
	tc.googleSearch.doit();
	window.setTimeout(tc.googleSearch.doit,1000);    
	window.setTimeout(tc.googleSearch.observe,500);
    }

    doOb();
    safari.self.addEventListener("message",tc.onResponse, false);
}

