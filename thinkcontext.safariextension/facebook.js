if (window.top === window) {
    if(document.domain == 'facebook.com' || document.domain == 'www.facebook.com'){
	console.log('facebook',document.domain,tc);	
tc.facebook = {};
var $observerSummaryRoot = $("body");

tc.facebook.summaryCallback = function(summaries){
    $observerSummaryRoot.mutationSummary("disconnect");
    doOb();
}

function doOb(){
    tc.facebook.examine();
    window.setTimeout(tc.facebook.observe,500);
    window.setTimeout(tc.facebook.examine,1000);
}

tc.facebook.observe = function(){
    $observerSummaryRoot.mutationSummary("connect"
					 , tc.facebook.summaryCallback
					 , [{ element:"div" }]);
}

tc.registerResponse('link', function(request){
    $("[sid=" + request.sid +"]").map(function(){
	tc.resultPrev(this,request.key,request.data);});
});

tc.facebook.examine = function(){
    $('div.ego_unit > div:first-child > div:first-child > a:nth-child(2) div[title] > div:nth-child(2)').not('[sid]').map(
	function(){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    tc.sendMessage({kind: 'link'
     			    , sid: sid
     			    , key: tc.sigURL(this.textContent)});
	    
	});}

doOb();


	safari.self.addEventListener("message",tc.onResponse, false);
    }
}
