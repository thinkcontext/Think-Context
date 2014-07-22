if (window.top === window && !tc.found && document.domain.match(/(^|\.)plus\.google\.com$/)) {
    tc.registerResponse('place', tc.popDialog);
    
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
}
