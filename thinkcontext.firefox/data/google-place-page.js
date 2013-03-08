if (window.frameElement === null){
    
tc.registerResponse('place', 
		    function(request){
			var data = request.data;
			var icon, title, blurb, rdc, tcstat = 'gsp';
			var z = tc.random();
			var revDiv = $('<div>',{id:"z"+z}).appendTo('body');
			rdc = tc.resultDialogConfig["hotel"+data.type];
			new EJS({text:rdc.template}).update("z"+z,data);
			tc.popDialog(rdc.title, revDiv, 'z'+z,true,rdc.icon,'other');
		    });

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