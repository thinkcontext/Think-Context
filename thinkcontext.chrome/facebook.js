tc.registerResponse('link', function(request){
    $("[sid=" + request.sid +"]").map(function(){
	tc.sub[request.data.func](this,request.key,request.data);});
});

tc.facebook = {};
tc.facebook.examine = function(){
    $('div.adInfo a').not('a[sid]').map(
	function(){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    tc.sendMessage({'kind': 'link'
     			    , 'sid': sid
     			    , 'key': tc.sigURL(this.innerText).replace(/https?:\/\//,'').replace(/\/$/,'') });
	    
	});}

tc.facebook.examine();
setInterval(tc.facebook.examine, 1000);
