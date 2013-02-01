tc.facebook = {};
tc.reverseResponseFB = 1;

tc.registerResponse('link', function(request){
    $("[sid=" + request.sid +"]").map(function(){
	tc.sub[request.data.func](this,request.key,request.data);});
});

tc.registerResponse('reversehome', tc.reverseResponse);

tc.facebook.examine = function(){
    var urlmap;
    urlmap = $("a[href*='facebook.com/l.php']").not('[tcRev]').map(function(){
	this.setAttribute('tcRev','tcRev');
	var url, m = this.href.match(/u=(http[^\&]*)/);
	if(m.length == 2){
	    url = decodeURIComponent(m[1]);
	    if(this.innerText.match(/\w/) && tc.sigURL(url) != tc.sigURL(document.URL)){
		return tc.sigURL(url);
	    }}});
    if(urlmap.length > 0){
    	var revArr = jQuery.makeArray(urlmap);
	console.log(revArr);
    	while(revArr.length > 0){
    	    tc.sendMessage(
    		{'kind': 'reversehome'
    		 , 'key': revArr.slice(0,400)
    		});
    	    revArr.splice(0,400);
    	}
    }

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
