if (window.top === window && !tc.found && document.domain.match(/(^|\.)twitter\.com$/)) {
    tc.found = true;
    tc.debug && console.log('twitter');
    tc.twitter = {};

    var proHandle, canon;
    canon = $("head link[rel='canonical']");
    if(canon.length == 1){
	proHandle = new tc.urlHandle(canon[0].href);
    }
    var $observerSummaryRoot = $("div#page-container");

    tc.twitter.summaryCallback = function(summaries){
	tc.debug >= 3 && console.log('disconnect');
	$observerSummaryRoot.mutationSummary("disconnect");
	tc.twitter.doOb();
    }

    tc.twitter.doOb = function(){
	tc.debug >= 3 && console.log('doob');
	tc.twitter.examine();
	window.setTimeout(tc.twitter.observe,500);
	window.setTimeout(tc.twitter.examine,1000);
    }

    tc.twitter.observe = function(){
	tc.debug >= 3 && console.log('observe');
	$observerSummaryRoot.mutationSummary("connect"
					     , tc.twitter.summaryCallback
					     , [{ element:"div" }]);
    }

    tc.twitter.examine = function(){
	tc.debug >= 3 && console.log('examine');
	tc.handleExamine("div#profile_popup-body div.profile-details[data-screen-name]"
			 ,'twitter'
			 ,function(x){ return 'https://twitter.com/' + x.attributes['data-screen-name']; });
	tc.handleExamine("a.js-user-profile-link:not([href*='"+proHandle.path+"']),a.twitter-atreply:not([href*='"+proHandle.path+"'])",
			 'twitter'
			 , null
			 , function(x){
			     if(x.parentElement.parentElement.className == 'tweet-box rich-editor'){
			 	 return;
			     }
			     return x;
			 }
			);
    }

    tc.twitter.doOb();
}
