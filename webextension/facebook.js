if (window.top === window && !tc.found && document.domain.match(/(^|\.)facebook\.com$/)) {
    tc.found = true;
    tc.facebook = {};
    var $observerSummaryRoot = $("body");

    tc.facebook.summaryCallback = function(summaries){
      $observerSummaryRoot.mutationSummary("disconnect");
	     tc.facebook.doOb();
    }

    tc.facebook.doOb = function(){
      tc.facebook.examine();
	    window.setTimeout(tc.facebook.observe,500);
	    window.setTimeout(tc.facebook.examine,1000);
    }

    tc.facebook.observe = function(){
	     $observerSummaryRoot.mutationSummary("connect"
          , tc.facebook.summaryCallback
					, [{ element:"div" }]);
    }

    tc.facebook.examine = function(){
	     tc.handleExamine("div.ego_unit > div:first-child > div:first-child > a:nth-child(2) div[title] > div:nth-child(2)"
			 ,'urlfrag'
			 ,function(x){ return x.textContent }
			);

	    tc.handleExamine("div:has(a.uiStreamSponsoredLink) > h5 a","facebook");
    }

    tc.facebook.doOb();
}
