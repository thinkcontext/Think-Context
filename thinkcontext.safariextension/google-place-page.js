if (window.top === window) {
    if(document.baseURI.search("^http(s)?://plus.google.com/") >= 0){
	tc.registerResponse('place', tc.resultPop);

	tc.googlePlaceExamine = function(){

	    var cid_regex = new RegExp('plus.google.com/([0-9]+)');
	    var cid_res = cid_regex.exec(document.URL);
	    if(cid_res[1]){
		tc.sendMessage(
		    {'kind': 'place'
		     , 'type': 'google'
		     , 'subtype': 'gp-cid'
		     , 'key': cid_res[1]});
	    }
	};

	tc.googlePlaceExamine();
	safari.self.addEventListener("message",tc.onResponse, false);
    }
}