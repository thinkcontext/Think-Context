if (window.top === window && document.domain == 'mail.google.com') {
tc.gmail = {};

tc.gmail.pageExamine = function(){
    //console.log('examine');
    tc.searchLinkExam("a[href*='googleadservices.com/pagead/aclk'].vd, div.aBD a.mr"
		      , 'gmail'
		      , null
		      , function(x){return x.textContent});		
}

var $observerSummaryRoot = $("body");
tc.gmail.summaryCallback = function(summaries){
    //console.log('disconnect');
    $observerSummaryRoot.mutationSummary("disconnect");
    tc.gmail.doOb();
}

tc.gmail.doOb = function(){
    tc.gmail.pageExamine();
    window.setTimeout(tc.gmail.pageExamine,1000);    
    window.setTimeout(tc.gmail.observe,500);
}

tc.gmail.observe = function(){
    //console.log('observe');
    $observerSummaryRoot.mutationSummary("connect"
					 , tc.gmail.summaryCallback
					 , [{element: 'div'}]
					);
}

tc.gmail.doOb();
    safari.self.addEventListener("message",tc.onResponse, false);
}
