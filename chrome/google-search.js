if (window.top === window && !tc.found && document.domain.search(/^www\.google(\.(co|com))?\.[a-z]{2,3}$/) == 0) {
    tc.found = true;
    tc.googleSearch = {};
    var $observerSummaryRoot = $("body");
    
    if(document.location.pathname.search(/^\/(webhp|search)$/) == 0
       ||document.location.href.search('.*www.google.com/#') >= 0
       ||($('div#center_col').length == 0 && document.location.pathname == '/')
      ){
	tc.googleSearch.observe = function(){
	    $observerSummaryRoot.mutationSummary("connect"
						 , tc.googleSearch.summaryCallback
						 , [{ characterData:true }]);
	}
	tc.googleSearch.doit = function(){
	    //     ad links
	    tc.handleExamine('li.ads-ad:has(h3) div.ads-visurl cite'
			     ,null
			     , function(x){ return 'http://' + x.textContent}
			     , function(x){return x.parentElement.children[0]}
			    );
	    
	    //	result link	
	    tc.handleExamine(".g > .r, .rc > h3 > a",null);
	}
    }else if(document.location.pathname.search('/maps') == 0){
	
	if(document.location.search.search('output=classic') >= 0){
	    // classic maps interface
	    
	    tc.googleSearch.observe = function(){
		$observerSummaryRoot.mutationSummary("connect"
						     , tc.googleSearch.summaryCallback
						     , [{ element: 'div' }]);
	    }
	    
	    tc.googleSearch.doit = function(){
		// sidebar
		tc.handleExamine("div.one span.pp-headline-authority-page"
				 , null
				 , function(x){return 'http://' + x.textContent}
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
				);	
		
		// in map popup dialogs		
		tc.handleExamine("div.gmnoprint td.basicinfo div#iwhomepage a"
				 , null
				 , function(x){return 'http://' + x.textContent}
				 , null
				);	    
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
		tc.handleExamine("div.cards-entity-url a"
				 , null
				 , function(x){return 'http://' + x.textContent}
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
				);		
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
    if(tc.googleSearch.doit)
	tc.googleSearch.doOb();
}
