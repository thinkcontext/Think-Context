console.log("google maps");

tc.googlePlacesHandler = function(siteid, icon, title, blurb){
    $("div.one:has(a.pp-more-content-link[href *= 'plus.google.com/" + siteid + "']) > div.lsicon > div:first").map(
	function(){
	    tc.insertPrev(this,icon,title,blurb,null,null);
	    this.previousElementSibling.style.display = "block";
	    this.style.display = "block";
	})
}

tc.registerResponse('places', tc.googlePlaces);
var cid_regex = new RegExp('plus.google.com/([0-9]+)');

//setInterval(function(){
    var urlmap = $("div.res div.one > div.vcard > div > div > span > span > a[href *= 'plus.google.com']").map(
	function(){
	    cid_res = cid_regex.exec(this.href);
	    if(cid_res[1]){
		var cid = cid_res[1];
		return [ {cid:cid} ];
	    }
	});
//    console.log(urlmap);
//}, 3000);
if(urlmap){
    //console.log(jQuery.makeArray(urlmap));
    tc.sendMessage({'kind': 'places'
		    , 'data': jQuery.makeArray(urlmap)
		    , 'type': 'google'
		   });
}
