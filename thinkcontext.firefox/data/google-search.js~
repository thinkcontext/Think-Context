if (window.frameElement === null){
    //console.log("google-search.js");
    tc.googleSearch = {

	googlePreInsert: function(n){
	    n.addEventListener('DOMNodeRemoved',function(){ listenResults(); },false);
	    tc.googleSearch.nolistenResults();

	}

	, googlePostInsert: function(n){
	    tc.googleSearch.listenResults();
	}

	, doit: function(){
	    var sub = {
	    };

	    function insertSubvertisements(message){
		// var result= '';
		// var tcstat = 'gss';

		// if(message.data && message.data.length > 0){
		//     var subvs = message.data;
		//     var sel = [];
		//     var x = 0;
		//     if(subvs.length > 3){
		// 	for(x=0;x<=2;x++){
		// 	    var i = Math.floor(Math.random() * 100000)% subvs.length ;
		// 	    sel.push(subvs[i]);
		// 	    subvs.splice(i,1);
		// 	}
		//     } else {
		// 	sel = subvs;
		//     }
		//     result = sel.map(function(subv){ 
		// 	var d = JSON.parse(subv.data);
		// 	var link = subv.url;
		// 	var id = subv.id;
		// 	var name = d.name;
		// 	var ds = d.desc.split(' ')
		// 	var blurb = ds.slice(0,14).join(' ');
		// 	if(ds.length > 14)
		// 	    blurb += '...';
		// 	var host = link.split('/')[0];
		// 	return '<li class="knavi"><h3><a tcstat="' + tcstat + id + '"  target="_blank" href="http://' + link + '">'+ name + '</a></h3>' + blurb + '<br><div><cite>'+ host + '</cite></div></li>'; }).join(' ');
		// }
		// var c;
		// if($("div#rhs").length == 0){
		//     // no right column so insert one for subvertisements
		//     c = document.createElement("div");
		//     c.id = "rhs";
		//     c.innerHTML = '<div id="rhs_block"></div>';
		//     c.style.position = "absolute";
		//     c.style.right = "0px";
		//     c.style.top = "0pt";
		//     c.style.width = "254px";
		//     $("div#rhscol").append(c);
		// } 
		
		// if($("table#mbEnd").length == 0){
		//     // no right column so insert one for subvertisements
		//     c = document.createElement("table");
		//     c.id = "mbEnd";
		//     c.innerHTML = "<tbody></tbody>";
		//     $("div#rhs_block").append(c);
		// } 
		// $("table#mbEnd").map(function(){
		//     if(result != ''){
		// 	var subvDiv = document.createElement("tr");
		// 	subvDiv.setAttribute("subv",true);
		// 	subvDiv.innerHTML = "<ol>"+ result + "</ol>";
		// 	nolistenRightColumn();
		// 	if(this.firstChild.getAttribute("subv") == null){
		// 	    this.insertBefore(subvDiv,this.firstChild);
		// 	} else {
		// 	    this.replaceChild(subvDiv,this.firstChild);
		// 	}
		// 	listenRightColumn();
		//     }
		// }
		// 		    );
		// $("table#mbEnd a[tcstat]").click(function(){
		//     tc.sendMessage({'kind': 'sendstat'
	 	// 		    , 'key': this.attributes['tcstat'].value});
		// });
		
	    }
	    
	    tc.registerResponse('link', function(request){
		console.error('link response');
		$("[sid=" + request.sid +"]").map(function(){
		    this.addEventListener('DOMNodeRemoved', function(){pageExamine();},false);
		    tc.sub[request.data.func](this,request.key,request.data);});
	    });

	    tc.registerResponse('links', function(request){
		console.error('links response');
		var data = request.data;
		var orig = request.orig_data;
		var out = {};
		for(var i in data){
		    for (var k in orig){
			if(orig[k].key.match('(\w+\.)?'+ data[i].key + '(/.+)?')){
			    $('a[sid=' + orig[k].sid + ']').map(
				function(){
				    tc.sub[data[i].func](this,data[i].key,data[i]);
				});
			}
		    }
		}
	    });
	    
	    tc.registerResponse('places',tc.googlePlaces);

	    tc.registerResponse('place', function(request){
		switch(request.subtype){
		case 'gs-cid':
		    $("div:has([sid=" + request.sid +"]) > h4 > a").map(function(){
			tc.sub['place' + request.data.type](this,request.key,request.data);});
		    break;
		case 'gs-ptable':
		    $("div:has([sid=" + request.sid +"]) > h3 > a").map(function(){
			tc.sub['place'+request.data.type](this,request.key,request.data);
		    });
		    break;
		case 'gs-lcll':
		    $("[sid=" + request.sid +"]").map(function(){
			this.addEventListener('DOMNodeRemoved', function(){pageExamine();},false)
			tc.sub['place'+request.data.type](this,request.key,request.data);});
		    break;
		}
	    });

	    // tc.registerResponse('gs-text', function(request){
	    // 	insertSubvertisements(request);
	    // });
	    
	    // function listenQuery(){
	    // 	$('p#bfl').live('DOMNodeRemoved',function(){examineQuery();});
	    // }

	    function listenResults(){
		$("ol#rso > li:first").live("DOMNodeInserted"
					    ,function(){ 
						tc.closeAllDialogs(); 
						tc.googleSearch.examineResults();});
	    }

	    function listenRightColumn(){
		//$("div#rhscol").live("DOMNodeInserted",function(){examineQuery();});
	    }
	    
	    // function nolistenQuery(){
	    // 	$('p#bfl').die('DOMNodeRemoved');
	    // }

	    function nolistenResults(){
		$("ol#rso > li:first").die("DOMNodeInserted");
	    }

	    // function nolistenRightColumn(){
	    // 	$("div#rhscol").die("DOMNodeInserted");
	    // }

	    // function examineQuery(){
	    // 	//the query text
		
	    // 	var qt =  $("input[name=q]").val();
	    // 	// check if we're doing instant search
	    // 	if(tc.googleSearch.instant){
	    // 	    var nq = $("a#sflas")[0].search;
	    // 	    var nqr = new RegExp('q=([^&]+)');
	    // 	    qt = decodeURIComponent(nqr.exec(nq)[1]);
	    // 	}
	    // 	var result='';
	    // 	var location = $("div#lc li.tbos").text();
	    // 	//console.log("query text and location " + qt + " " + location);
	    // 	tc.sendMessage(
	    // 	    {'kind' : "gs-text"
	    // 	     , 'key' : qt.replace('+',' ')
	    // 	     , 'location' : location
	    // 	    });
	    // }

	    function installListeners(){
		//listenQuery();
		listenResults();
		//listenRightColumn();
	    }
	    
	    function pageExamine(){
		//examineQuery();
		tc.googleSearch.examineResults();
	    }

	    pageExamine();
	    setTimeout(installListeners,300);
	}
	,  examineResults: function(){
	    
	    console.error('examineresults');
	    // place page in an lclbox brief results
	    // eg "westin dc"
	    var urlmap = $("li#lclbox  div.vsc > div > div > a[href *= 'plus.google.com']").map(
		function(){
    		    if(this.parentNode.children[0] && this.parentNode.children[0].getAttribute && !this.parentNode.children[0].getAttribute('subv')){
			var cid_regex = new RegExp('plus.google.com/([0-9]+)');
    			cid_res = cid_regex.exec(this.href);
			if(cid_res[1]){
			    var cid = cid_res[1];
			    //var sid = "gs" + Math.floor(Math.random() * 100000);
			    //this.parentNode.children[0].setAttribute("sid",sid);
			    return [ {cid:cid} ];
			}
		    }
		}
	    );

	    if(urlmap){
		console.error(jQuery.makeArray(urlmap));
		tc.sendMessage({'kind': 'places'
				,'type': 'google'
				,'subtype': 'gs-cid'
				, 'data': jQuery.makeArray(urlmap)
			       });
	    }

	    
	    // place page in an lclbox long result
	    // eg "hay adams hotel"
	    $("li:has(div > h3 > a) > div > div > #lclbox > a[href*='plus.google.com']:first").map(
		function(){
		    var target = this.parentNode.parentNode.parentNode.children[0].children[0];
    		    if(target && target.getAttribute && !target.getAttribute('subv')){
			var cid_regex = new RegExp('plus.google.com/([0-9]+)');
    			cid_res = cid_regex.exec(this.href);
			if(cid_res[1]){
			    var cid = cid_res[1];
			    var sid = "gs" + Math.floor(Math.random() * 100000);
			    target.setAttribute("sid",sid);
			    tc.sendMessage({'kind': 'place'
					    , 'type': 'google'
					    ,'subtype': 'gs-lcll'
					    , 'sid': sid
					    , 'key': cid  });
			}
		    }
		}
	    );
	    
	    // place not in an lclbox
	    // boston hotels
	    $("div.intrlu > div > span > a[href*='//plus.google.com/']").map(
		function(){
		    var cid_regex = new RegExp('plus.google.com/([0-9]+)');
    		    cid_res = cid_regex.exec(this.href);
		    if(cid_res[1]){
			var cid = cid_res[1];
			var sid = "gs" + Math.floor(Math.random() * 100000);
			this.setAttribute("sid",sid);
			tc.sendMessage({ 'kind': 'place'
					 ,'subtype': 'gs-ptable'
					 , 'sid': sid
					 , 'type': 'google'
					 , 'key': cid  });
		    }
		}
	    );

	    //	result link	

	    var resultmap = $("ol#rso > li.g > div > h3 > a").map(function(){
	    	if(!this.getAttribute('sid')){
	    	    var sid = "gs" + Math.floor(Math.random() * 100000);
	    	    this.setAttribute("sid",sid);
	    	    return [ { sid: sid
	    		       , key: tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'')}];
	    	}
	    });
	    if(resultmap.length > 0){
	    	tc.sendMessage({'kind': 'links'
	    			, data: jQuery.makeArray(resultmap).slice(0,15)});
	    }
	    
	    // performance is slow, code not in sync w/ other browsers
	    // $("ol#rso > li.g > div > h3 > a").map(function(){
	    // 	var sid = "gs" + Math.floor(Math.random() * 100000);
	    // 	this.setAttribute("sid",sid);
	    // 	tc.sendMessage({'kind': 'link'
     	    // 			, 'sid': sid
     	    // 			, 'key': tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'') });
	    // });
	    
	    
	}
    }
    if(document.location.href.search('.*www.google.com/search\?.*') >= 0
       ||document.location.href.search('.*www.google.com/webhp') >= 0
       ||document.location.href.search('.*www.google.com/#') >= 0
       ||($('div#center_col').length == 0 && document.location.hostname == 'www.google.com' && document.location.pathname == '/')
      ){
	tc.googleSearch.doit();
    }else{
	tc.registerResponse('reversehome', tc.reverseResponse);
	tc.reverseExamine();
    }
}