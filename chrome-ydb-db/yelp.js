$('a.biz-name').not('[tcid]').map(
    function(){
	if(this.href.match('/biz/(\w+)')){
	    tc.sendMessage({
		kind: 'yelp'
		, handle: 'yelp:' + m[1]});
	}
    });