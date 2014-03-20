tc.popSend();

$('div.ego_unit > div:first-child > div:first-child > a:nth-child(2) div[title] > div:nth-child(2)').not('[tcid]').map(
    function(){
	var h = new tc.urlHandle(this.textContent);
	if(h){
	    var tcid = tc.random();
	    this.setAttribute("tcid",tcid);
	    tc.sendMessage({kind: 'link'
     			    , tcid: tcid
     			    , handle: h.handle});
	}
	
    });

$('a',$("span:contains('Suggested Post')").parent()).not('[tcid]').map(
    function(){
	var h = new tc.urlHandle(this.href);
	if(h){
	    var r = tc.random();
	    this.setAttribute('tcid',r);
	    tc.sendMessage({
		kind: 'link'
		, tcid: r
		, handle: h.handle});	    
	}
    });


