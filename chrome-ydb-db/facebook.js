tc.popSend();

$('div.ego_unit > div:first-child > div:first-child > a:nth-child(2) div[title] > div:nth-child(2)').not('[sid]').map(
    function(){
	var sid = "gs" + tc.random();
	this.setAttribute("sid",sid);
	tc.sendMessage({kind: 'link'
     			, sid: sid
     			, key: tc.sigURL(this.textContent)});
	
    });}


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


