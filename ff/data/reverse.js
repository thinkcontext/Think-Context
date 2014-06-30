if (window.top === window && !tc.found) {
    tc.reverse = {};

    tc.popSend();

    tc.reverse.doit = function(){
	tc.handleExamine("a[href*='shlinks.industrybrains.com']"
			 ,'urlfrag'
			 ,function(x){ return x.textContent;}
			);
	
	tc.handleExamine("li > h4 > a[href*='googleadservices.com/pagead/aclk']");
	
	tc.handleExamine("div.adsonarAd > a.displayUrl"
			 ,'urlfrag'
			 ,function(x){ return x.textContent;}
			);

	tc.handleExamine("[itemtype='http://schema.org/Organization'] [itemprop='url']"
			 ,'urlfrag'
			 ,function(x){ console.log(x.href); return x.href; }
			 ,function(x){ console.log(x.parentElement); return x.parentElement; });


	// $("object param[name='flashvars'][value*='2mdn.net']").not('a[sid]').map(
	//     function(){
	// 	if(m = this.value.match(/link\%253D(http[^\&]+)/) && m[1]){
	// 	    console.log("img 2mdn",m[1]);
	// 	}
	//     });
	
	// $("object param[value*='adurl%3Dhttp%253A%252F%252Fad.doubleclick.net/click']").not('a[sid]').map(
	// 	function(){
	// 	    console.log(this);
	// 	    var sid = "gs" + tc.random();
	// 	    this.setAttribute("sid",sid);
	// 	    var m = this.value.match(/sscs%253D%253fhttp(s)?%3A\/\/([^\/]+)/);
	// 	    if(m && m.length == 3){
	// 		console.log('doubleclick param ' + m[2]);
	// 		tc.sendMessage({kind: 'link'
	// 				, subtype: 'imgad'
	// 				, sid: sid
	// 				, key: tc.sigURL(m[2])});
	
	
	// 	    }
	// 	});
	
	// $("a[href*='adurl%3Dhttp%253A%252F%252Fad.doubleclick.net/click']:has(img)").not('a[sid]').map(
	// 	function(){
	// 	    var sid = "gs" + tc.random();
	// 	    this.setAttribute("sid",sid);
	// 	    var m = this.value.match(/sscs%253D%253fhttp(s)?%3A\/\/([^\/]+)/);
	// 	    if(m && m.length == 3){
	// 		console.log('doubleclick param ' + m[2]);
	// 		tc.sendMessage({kind: 'link'
	// 				, subtype: 'imgad'
	// 				, sid: sid
	// 				, key: tc.sigURL(m[2])});
	
	
	// 	    }
	// 	});
	
	// $("object[flashvars*='click=http%3A%2F%2Fad.doubleclick.net']").not('a[sid]').map(
	// 	function(){
	// 	    var m = this.attributes.flashvars.textContent.match(/exitEvents=[^\&]*url%253Ahttp%25253A%2F%2F([^\%]+)/);
	// 	    if(m && m.length == 2){
	// 		console.log('doubleclick object ' + m[1]);
	// 		tc.sendMessage({kind: 'link'
	// 				, subtype: 'imgad'
	// 				, sid: sid
	// 				, key: tc.sigURL(m[2])});		
	// 	    }
	// 	});
    }

    window.setTimeout(tc.reverse.doit,500);
}
