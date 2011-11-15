if(document.baseURI.search('.*www.google.com/search\?.*') >= 0
||document.baseURI.search('.*www.google.com/webhp') >= 0
||document.baseURI.search('.*www.google.com/#') >= 0
){
console.log("google-search.js");

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
	    greenResult: function(n,key,data){
		var detail = JSON.parse(data.data);
		var tcstat = 'gsg';
		tc.insertPrev(n
			      ,'greenG'
			      ,'Member of the Green Business Network','<b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://' + key + '/">'+ detail.name+ '</a></b> - ' + detail.desc 
			      , tc.googlePreInsert
			      , tc.googlePostInsert
			     );
	    },
	    
	    hyatt_result: function(n,key,data){
		// passed a google search result, insert a dialog
		// "n" is the header link for the result
		
		var tcstat = 'gsh';
		tc.insertPrev(n
			      ,'infoI'
			      ,'Info from Hotel Workers Rising','<b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://hotelworkersrising.org/hyatt/">Hyatt Hurts Our Economic Recovery</a></b> - In city after city across North America, Hyatt Hotels is leading the fight against middle class jobs for hotel workers. Nationwide, the hotel industry is rebounding faster and stronger than expected, with a hearty rebound projected in 2011 and 2012. Hyatt reported that as of June 30, 2010 it had over $1.6 billion in cash and short term investments available.<p>Despite a strong recovery for the hotel industry, hotels are still squeezing workers and cutting staff. While this marks a trend involving several major hotel companies, Hyatt is the starkest example. Hyatt is using the weak economy as an excuse to slash benefits, eliminate jobs and lock workers into the recession. <a tcstat="' + tcstat + data.id + '" target="_blank" href="http://hotelworkersrising.org/hyatt/">more info</a>'
			      , tc.googlePreInsert
			      , tc.googlePostInsert
			     );
	    }

	    , place: function(n, cid, pb,data){
		var tcstat = 'gsp';
		if(pb == 'patronize'){
		    tc.insertPrev(n
				  ,'greenCheck'
				  ,'Patronize This Hotel'
				  ,'<div><b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a></b> - Recommends patronizing this hotel</div>'
				  , tc.googlePreInsert
				  , tc.googlePostInsert
				 );
		} else if(pb == 'boycott'){
		    tc.insertPrev(n
				  ,'redCirc'
				  ,'Boycott This Hotel'
				  ,'<div><b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a></b> - Recommends boycotting this hotel</div>'
				  , tc.googlePreInsert
				  , tc.googlePostInsert
				 );
		} else if(pb == 'risky'){
		    tc.insertPrev(n
				  ,'infoI'
				  ,'Risk of Labor Dispute At This Hotel'
				  ,'<div><b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a></b> advises that there is a risk of a labor dispute at this hotel.</div>'
				  , tc.googlePreInsert
				  , tc.googlePostInsert
				 );
		}
	    },
	    
	    placeboycott: function(n, cid, data){
		sub.place(n,cid,'boycott',data);
	    },

	    placestrike: function(n, cid, data){
		sub.place(n,cid,'boycott',data);
	    },

	    placerisky: function(n, cid, data){
		sub.place(n,cid,'risky',data);
	    },

	    placesafe: function(n, cid, data){
		sub.place(n,cid,'patronize',data);
	    },

	    hotelboycott: function(n, cid, data){
		sub.place(n,cid,'boycott',data);
	    },

	    hotelstrike: function(n, cid, data){
		sub.place(n,cid,'boycott',data);
	    },

	    hotelrisky: function(n, cid, data){
		sub.place(n,cid,'risky',data);
	    },

	    hotelsafe: function(n, cid, data){
		sub.place(n,cid,'patronize',data);
	    }

	};

	function insertSubvertisements(message){
	    var result= '';
	    var tcstat = 'gss';

	    if(message.data && message.data.length > 0){
		var subvs = message.data;
		var sel = [];
		var x = 0;
		if(subvs.length > 3){
		    for(x=0;x<=2;x++){
			var i = Math.floor(Math.random() * 100000)% subvs.length ;
			sel.push(subvs[i]);
			subvs.splice(i,1);
		    }
		} else {
		    sel = subvs;
		}
		result = sel.map(function(subv){ 
		    var d = JSON.parse(subv.data);
		    var link = subv.url;
		    var id = subv.id;
		    var name = d.name;
		    var ds = d.desc.split(' ')
		    var blurb = ds.slice(0,14).join(' ');
		    if(ds.length > 14)
			blurb += '...';
		    var host = link.split('/')[0];
		    return '<li class="knavi"><h3><a tcstat="' + tcstat + id + '"  target="_blank" href="http://' + link + '">'+ name + '</a></h3>' + blurb + '<br><div><cite>'+ host + '</cite></div></li>'; }).join(' ');
	    }
	    var c;
	    if($("div#rhs").length == 0){
		// no right column so insert one for subvertisements
		c = document.createElement("div");
		c.id = "rhs";
		c.innerHTML = '<div id="rhs_block"></div>';
		c.style.position = "absolute";
		c.style.right = "0px";
		c.style.top = "0pt";
		c.style.width = "254px";
		$("div#rhscol").append(c);
	    } 
	    
	    if($("table#mbEnd").length == 0){
		// no right column so insert one for subvertisements
		c = document.createElement("table");
		c.id = "mbEnd";
		c.innerHTML = "<tbody></tbody>";
		$("div#rhs_block").append(c);
	    } 
	    $("table#mbEnd").map(function(){
		if(result != ''){
		    var subvDiv = document.createElement("tr");
		    subvDiv.setAttribute("subv",true);
		    subvDiv.innerHTML = "<ol>"+ result + "</ol>";
		    nolistenRightColumn();
		    if(this.firstChild.getAttribute("subv") == null){
			this.insertBefore(subvDiv,this.firstChild);
		    } else {
			this.replaceChild(subvDiv,this.firstChild);
		    }
		    listenRightColumn();
		}
	    }
				);
	    $("table#mbEnd a[tcstat]").click(function(){
		tc.sendMessage({'kind': 'sendstat'
	 				      , 'key': this.attributes['tcstat'].value});
	    });
	    
	}
    
	tc.registerResponse('link', function(request){
	    $("[sid=" + request.sid +"]").map(function(){
		this.addEventListener('DOMNodeRemoved', function(){pageExamine();},false);
		sub[request.data.func](this,request.key,request.data);});
	});

	
	tc.registerResponse('gs-finance', function(request){
	    var data = JSON.parse(request.data.data);
	    var tcstat = 'gsf' + request.data.id;
	    $("[sid="+request.sid+"]").map(
		function(){
		    var supporters = data['Supporters'].join(' ');
		    var message = '<div>This company has an upcoming proxy vote. ' + supporters + ' have an opionion on the vote.  <a tcstat="'+tcstat+'" target="_blank" href="' + data['BallotUrl'] + '">More info</a></div>';
		    tc.insertPrev(this,'infoI','Proxy Vote Info',message, tc.googlePreInsert
					      , tc.googlePostInsert
					     );
		}
	    );
	});

	tc.registerResponse('places',function(request){ 
	    console.timeEnd("doing onResponse places");
	    var data = request.data;
	    var d;
	    var icon;
	    var title;
	    var blurb;
	    var tcstat = 'gsp';
	    for(var r in data){
		d = data[r];
		if(d.type == 'safe'){
		    icon = 'greenCheck';
		    title = '<img src="'+ tc.icons['greenCheck'] + '"> Patronize This Hotel';
		    blurb = '<div><b><a tcstat="' + tcstat + d.id + '" target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a></b> - Recommends patronizing this hotel</div>';
		} else if(d.type == 'boycott' || d.type == 'strike'){
		    icon = 'redCirc';
		    title = '<img src="'+ tc.icons['redCirc'] + '"> Boycott This Hotel';
		    blurb = '<div><b><a tcstat="' + tcstat + d.id + '" target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a></b> - Recommends boycotting this hotel</div>';
		} else if(d.type == 'risky'){
		    icon = 'infoI';
		    title = 'Risk of Labor Dispute At This Hotel';
		    blurb = '<div><b><a tcstat="' + tcstat + d.id + '" target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a></b> advises that there is a risk of a labor dispute at this hotel.</div>';
		}

		if(icon){
		    $("li#lclbox > div > div:has(div > div > div > a[href *= 'cid=" + d.siteid + "']) div > h4 > a").map(function(){
			tc.insertPrev(this,icon,title,blurb,tc.googlePreInsert,tc.googlePostInsert);});
		}
	    }
	});

	tc.registerResponse('place', function(request){
	    console.log("place response");
	    switch(request.subtype){
	    case 'gs-cid':
		$("div:has([sid=" + request.sid +"]) > h4 > a").map(function(){
		    sub['place' + request.data.type](this,request.key,request.data);});
		break;
	    case 'gs-ptable':
		$("div:has([sid=" + request.sid +"]) > h3 > a").map(function(){
		    sub['place'+request.data.type](this,request.key,request.data);
		});
		break;
	    case 'gs-lcll':
		$("[sid=" + request.sid +"]").map(function(){
		    this.addEventListener('DOMNodeRemoved', function(){pageExamine();},false)
		    sub['place'+request.data.type](this,request.key,request.data);});
		break;
	    }
	});

	tc.registerResponse('gs-text', function(request){
	    insertSubvertisements(request);
	});

	
	function listenQuery(){
	    console.log("listenQuery");
	    $('.gssb_a:first').live('DOMSubtreeModified',function(){console.log("dosubv.querySubv");examineQuery();});
	}

	function listenResults(){
	    console.log("listenResults");
	    $("ol#rso > li:first").live("DOMNodeInserted",function(){console.log("do listenResults"); tc.closeAllDialogs(); tc.googleSearch.examineResults();});
	}

	function listenRightColumn(){
	    //    console.log("started listenRightColumn");
	    //$("div#rhscol").live("DOMNodeInserted",function(){console.log("listen mbEnd");examineQuery();});
	}
	
	function nolistenQuery(){
	    console.log("stopped listenQuery");
	    $('.gssb_a:first').die('DOMSubtreeModified');
	}

	function nolistenResults(){
	    console.log("stopped listenResults");
	    $("ol#rso > li:first").die("DOMNodeInserted");
	}

	function nolistenRightColumn(){
	    console.log("stopped listenRightColumn");
	    $("div#rhscol").die("DOMNodeInserted");
	}

	function examineQuery(){
	    //the query text
	    
	    var qt =  $("input[name=q]").val();
	    // check if we're doing instant search
	    var sflas = $("a#sflas");
	    if(sflas.length > 0){
		var nq = $("a#sflas")[0].search;
		var nqr = new RegExp('q=([^&]+)');
		qt = decodeURIComponent(nqr.exec(nq)[1]);
	    }
	    var result='';
	    var location = $("div#lc li.tbos").text();
	    console.log("query text and location " + qt + " " + location);
	    tc.sendMessage(
		{'kind' : "gs-text"
		 , 'key' : qt.replace('+',' ')
		 , 'location' : location
		});
	    console.log("leaving examinequery");
	}


	function installListeners(){
	    listenQuery();
	    listenResults();
	    listenRightColumn();
	}
	
	function pageExamine(){
	    examineQuery();
	    console.log("calling examine results");
	    tc.googleSearch.examineResults();
	    console.log("left examineresults");
	    //tc.reverseExamine();
	}

	pageExamine();
	installListeners();
    }

    ,  examineResults: function(){
	//finance
	$('h2 > a[href*=/url][href*="?q=/finance"]').map(function(){
	    if(!this.previousSibling || !this.previousSibling.getAttribute || !this.previousSibling.getAttribute('subv')){
		var nqr = new RegExp('q\%3D([^&]+)');
		var q = decodeURIComponent(nqr.exec(this.search)[1]);
		var sid = "gs" + Math.floor(Math.random() * 100000);
		this.setAttribute("sid",sid);
		tc.sendMessage({'kind': 'gs-finance'
				, 'sid': sid
				, 'key': q
			       });
	    }});
	
	// place page in an lclbox brief results
	// eg "chicago hotels"
	var urlmap = $("li#lclbox > div > div > div > div > div > a[href *= 'cid']:nth-child(5)").map(
	    function(){
    		if(this.parentNode.children[0] && this.parentNode.children[0].getAttribute && !this.parentNode.children[0].getAttribute('subv')){
		    var cid_regex = new RegExp('cid=([0-9]+)');
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
	    tc.sendMessage({'kind': 'places'
			    ,'type': 'google'
			    ,'subtype': 'gs-cid'
			    , 'data': jQuery.makeArray(urlmap)
			   });
	}

	
	// place page in an lclbox long result
	// eg "hay adams hotel"
	$("li:has(div > h3 > a) > div > #lclbox > a[href*=cid]:first-child").map(
	    function(){
		var target = this.parentNode.parentNode.children[0].children[0];
    		if(target && target.getAttribute && !target.getAttribute('subv')){
		    var cid_regex = new RegExp('cid=([0-9]+)');
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
	$("li > div.vsc > div.intrlu > div > span > a[href^='http://maps.google.com/maps/place']:first-child").map(
	    function(){
		var cid_regex = new RegExp('cid=([0-9]+)');
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
	$("ol#rso > li.g > div > h3 > a").map(function(){
	    var sid = "gs" + Math.floor(Math.random() * 100000);
	    this.setAttribute("sid",sid);
	    tc.sendMessage({'kind': 'link'
     			    , 'sid': sid
     			    , 'key': tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'') });
	});
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