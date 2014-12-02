if (window.top === window && !tc.found && document.domain.match(/(^|\.)amazon\.com$/)) {
    tc.registerResponse('mov',tc.onLink);
    tc.registerResponse('pop',tc.onPop);
    var canon, item, ihandle, curl, iurl;
    var rl;

    // individual item
    canon = $("link[rel='canonical']:first");

    if(canon && canon.length == 1){
	curl = canon[0].href;
    }

    if(curl && curl.match(/dp\/[a-zA-Z0-9]{10}$/)){
	item = $("head meta[content*='imdb.com']:first");
	if(item && item.length == 1){
	    if(item[0].content){
		iurl = item[0].content;
		ihandle = new tc.urlHandle(iurl); 
		if(ihandle && ihandle.handle){
		    tc.sendMessage({
			kind: 'pop'
			, handle: ihandle.handle});
		}
	    }
	}
    } else {
	// send the pop here since we didn't above
	tc.popSend();
	
	// search list results
	rl = $("ul.s-result-list li.s-result-item");
	if(rl && rl.length > 0){
	    //movies
	    rl.has("a:contains('DVD') , a:contains('Instant Video'), a:contains('Blu-ray')").map(function(){
	    var $li = $(this);
	    var title = $li.find("a.s-access-detail-page").text().replace(/\[[^\]]*\]/g,'').trim();
	    var year = $li.find("span.a-color-secondary:first").text();
	    console.log(title,year);	    
	    var mhandle = new tc.movHandle(title,year);
	    if(mhandle.handle){
		var r = tc.random();	    
		this.setAttribute('tcid',r);
		tc.sendMessage({
		    kind: 'mov'
		    , tcid: r
		    , handle: mhandle.handle});
	    }
	});
    // } else if(){
	    
	}
    }
}
