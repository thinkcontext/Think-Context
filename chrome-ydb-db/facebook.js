tc.popSend();

$('a',$("span:contains('Suggested Post')").parent()).not('[tcid]').map(
    function(){
	var h = new UrlHandle(this.href);
	if(h){
	    var r = tc.random();
	    this.setAttribute('tcid',r);
	    tc.sendMessage({
		kind: h.kind
		, tcid: r
		, handle: h.handle});	    
	}
    });


