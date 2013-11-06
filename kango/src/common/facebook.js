tc.facebook = {};

tc.registerResponse('domain', function(request){
    var sid = data.request.sid;
    $("[sid=" + sid +"]").map(function(){
	tc.resultPrev(this,data);});
});

tc.facebook.examine = function(){
    var urlmap;

    $('div.adInfo a').not('a[sid]').map(
	function(){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    tc.sendMessage({kind: 'domain'
			    , source: 'facebook'
     			    , sid: sid
     			    , key: tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'').toLowerCase() });
	    
	});}

tc.facebook.examine();
setInterval(tc.facebook.examine, 1000);
