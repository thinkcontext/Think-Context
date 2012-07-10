if (window.top === window) {
if(document.baseURI.search("http://www.bing.com/search.*") >= 0){
tc.debug("bing-search");

sub = {
    greenResult: function(n,key,data){
	var detail = JSON.parse(data.data);
	var tcstat = 'bsg';
	tc.insertPrev(n
				,'greenG'
				,'Member of the Green Business Network','<b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://' + key + '/">'+ detail.name+ '</a></b> - ' + detail.desc 
				, null
				, null
			       );
    },
    
    hyatt_result: function(n,key,data){
	// passed a google search result, insert a dialog
	// "n" is the header link for the result
	
	console.log("hyatt_result: ");
	var tcstat = 'bsh';
	tc.insertPrev(n
				,'infoI'
				,'Info from Hotel Workers Rising','<b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://hotelworkersrising.org/hyatt/">Hyatt Hurts Our Economic Recovery</a></b> - In city after city across North America, Hyatt Hotels is leading the fight against middle class jobs for hotel workers. Nationwide, the hotel industry is rebounding faster and stronger than expected, with a hearty rebound projected in 2011 and 2012. Hyatt reported that as of June 30, 2010 it had over $1.6 billion in cash and short term investments available.<p>Despite a strong recovery for the hotel industry, hotels are still squeezing workers and cutting staff. While this marks a trend involving several major hotel companies, Hyatt is the starkest example. Hyatt is using the weak economy as an excuse to slash benefits, eliminate jobs and lock workers into the recession. <a tcstat="' + tcstat + data.id + '" target="_blank" href="http://hotelworkersrising.org/hyatt/">more info</a>'
				, null
				, null
			       );
    }
    , place: function(n, cid, pb,data){
	var tcstat = 'bsp';
	if(pb == 'patronize'){
	    tc.insertPrev(n
			  ,'greenCheck'
			  ,'Patronize This Hotel'
			  ,'<div><b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a></b> - Recommends patronizing this hotel</div>'
			  , null
			  , null
			 );
	} else if(pb == 'boycott'){
	    tc.insertPrev(n
			  ,'redCirc'
			  ,'Boycott This Hotel'
			  ,'<div><b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a></b> - Recommends boycotting this hotel</div>'
				    , null
				    , null
				   );
	} else if(pb == 'risky'){
	    tc.insertPrev(n
			  ,'infoI'
			  ,'Risk of Labor Dispute At This Hotel'
			  ,'<div><b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a></b> advises that there is a risk of a labor dispute at this hotel.</div>'
			  , null
			  , null
			 );
	}
    },

    placeboycott: function(n, cid, data){
	sub.place(n,cid,'boycott',data);
    },

    placepatronize: function(n, cid, data){
	sub.place(n,cid,'patronize',data);
    },

    placestrike: function(n, cid, data){
	sub.place(n,cid,'boycott',data);
    },
    placestrike: function(n, cid, data){
	sub.place(n,cid,'risky',data);
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
    , insertSubvertisements: function(message){
    var result= '';
    var tcstat = 'bss';
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
	    var name = d.name;
	    var ds = d.desc.split(' ')
	    var blurb = ds.slice(0,14).join(' ');
	    if(ds.length > 14)
		blurb += '...';
	    var id = subv.id;
	    var host = link.split('/')[0];
	    return '<li class="knavi"><h3><a tcstat="' + tcstat + id + '" target="_blank" href="http://' + link + '">'+ name + '</a></h3>' + blurb + '<br><div><cite>'+ host + '</cite></div></li>'; }).join(' ');
    } 
    $("div#sidebar").map(function(){
	if(result != ''){
	    var subvDiv = document.createElement("div");
	    subvDiv.setAttribute("subv",true);
	    subvDiv.innerHTML = result;
	    if(this.firstChild.getAttribute("subv") == null){
		this.insertBefore(subvDiv,this.firstChild);
	    } else {
		this.replaceChild(subvDiv,this.firstChild);
	    }
	}});
    $("div#sidebar a[tcstat]").click(function(){
	tc.sendMessage({'kind': 'sendstat'
	 		, 'key': this.attributes['tcstat'].value});
    });
}

}


tc.registerResponse('bing-text'
		    ,function(request){
			sub.insertSubvertisements(request);
		    });
tc.registerResponse('link',
		    function(request){
			$("[sid=" + request.sid +"]").map(function(){
			    sub[request.data.func](this,request.key,request.data);});
		    });

tc.registerResponse('place'
		    , function(request){
			$("[sid=" + request.sid +"]").map(function(){
			    sub[request.data.func](this,request.key,request.data);});
		    });

// query text
var qt =  $("input[name=q]").val();
//location
var loc = $('ul.sw_tn > li:nth-child(3) > a').text()
tc.sendMessage(
     {'kind' : "bing-text"
      , 'key' : qt
      , 'location' : loc
     });

// result link
$('div#results  li  div  div  h3  a').map(
    function(){
	var sid = "gs" + Math.floor(Math.random() * 100000);
	this.setAttribute("sid",sid);
	tc.sendMessage({'kind': 'link'
     			, 'sid': sid
     			, 'key': tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'') });

    }
);

// lid short link
$("li.hip_htlnm a[href*='lid=']").map(
    	function(){
    	    if(!this.previousSibling || !this.previousSibling.getAttribute || !this.previousSibling.getAttribute('subv')){
		var lid_regex = new RegExp('lid=([a-zA-Z0-9]+)');
    		lid_res = lid_regex.exec(this.href);
		if(lid_res[1]){
		    var lid = lid_res[1];
		    var sid = "gs" + Math.floor(Math.random() * 100000);
		    this.setAttribute("sid",sid);
		    tc.sendMessage({'kind': 'place'
				    ,'type': 'bing'
				    , 'sid': sid
				    , 'key': lid  });
		}
	    }
	}
);

// lid long link
$("div h2 div a[href*='lid=']").map(
    	function(){
	    tc.debug("lid long link");
    	    if(!this.previousSibling || !this.previousSibling.getAttribute || !this.previousSibling.getAttribute('subv')){
		var lid_regex = new RegExp('lid=([a-zA-Z0-9]+)');
    		lid_res = lid_regex.exec(this.href);
		tc.debug(lid_res);
		if(lid_res[1]){
		    var lid = lid_res[1];
		    var sid = "gs" + Math.floor(Math.random() * 100000);
		    this.setAttribute("sid",sid);
		    tc.sendMessage({'kind': 'place'
				    ,'type': 'bing'
				    , 'sid': sid
				    , 'key': lid  });
		}
	    }
	}
);
tc.registerResponse('reversehome', tc.reverseResponse);
tc.reverseExamine();
safari.self.addEventListener("message",tc.onResponse, false);
}
}