tc.facebook = {};

tc.registerResponse('link', function(request){
    $("[sid=" + request.sid +"]").map(function(){
	tc.resultPrev(this,request.key,request.data);});
});

tc.facebook.examine = function(){
    $('div.adboard_unit div._5fxl').not('[sid]').map(
	function(){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    tc.sendMessage({'kind': 'link'
     			    , 'sid': sid
     			    , 'key': tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'').toLowerCase() });
	    
	});}

tc.facebook.examine();
setInterval(tc.facebook.examine, 1000);
