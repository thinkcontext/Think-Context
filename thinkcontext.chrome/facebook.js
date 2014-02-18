tc.facebook = {};
var $observerSummaryRoot = $("div#pagelet_ego_pane");

function summaryCallback(summaries){
    $observerSummaryRoot.mutationSummary("disconnect");
    doOb();
}

function doOb(){
    tc.facebook.examine();
    window.setTimeout(tc.facebook.observe,750);
}

tc.facebook.observe = function(){
    $observerSummaryRoot.mutationSummary("connect"
					 , summaryCallback
					 , [{ characterData:true }]);
}

tc.registerResponse('link', function(request){
    $("[sid=" + request.sid +"]").map(function(){
	tc.resultPrev(this,request.key,request.data);});
});

tc.facebook.examine = function(){
    $('div.ego_unit > div:first-child > div:first-child > a:nth-child(2) > div[title] > div:nth-child(2)').not('[sid]').map(
	function(){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    tc.sendMessage({kind: 'link'
     			    , sid: sid
     			    , key: tc.sigURL(this.textContent)});
	    
	});}

doOb();


