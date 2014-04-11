console.log('twitter');

tc.popSend();
var $observerSummaryRoot = $("div#page-container");

function summaryCallback(summaries){
    console.log('disconnect');
    $observerSummaryRoot.mutationSummary("disconnect");
    doOb();
}

function doOb(){
    console.log('doob');
    examine();
    window.setTimeout(observe,500);
    window.setTimeout(examine,1000);
}

function observe(){
    console.log('observe');
    $observerSummaryRoot.mutationSummary("connect"
					 , summaryCallback
					 , [{ element:"div" }]);
}

function examine(){
    console.log('examine');
    tc.handleExamine("div.profile-card-inner[data-screen-name]"
		     ,'twitter'
		     ,function(x){ console.log(x); return 'https://twitter.com/' + x.attributes['data-screen-name']; });
    tc.handleExamine("a.js-user-profile-link",'twitter');
}

doOb();
