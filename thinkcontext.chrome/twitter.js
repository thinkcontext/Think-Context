tc.reverseResponseTwit = 1;
tc.registerResponse('reversehome', tc.reverseResponse);

setInterval(function(){
    var urlmap = $('a[data-ultimate-url]').map(
	function(){
	    if(! this.getAttribute('subv'))
		return this.getAttribute('data-ultimate-url');
	});
//    console.log(urlmap);
    if(urlmap){
	tc.sendMessage({'kind':'reversehome'
			, 'type':'twitter'
			, 'key': jQuery.makeArray(urlmap)}
		      )
    }
}
	    , 3000);