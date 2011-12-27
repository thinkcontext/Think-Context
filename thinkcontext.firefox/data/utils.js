var tc = {};
tc.dialogs = [];
tc.responses = {};
tc.examines = [];

tc.debug = function(txt){ 
    //console.log(txt); 
}

tc.registerResponse = function(kind, func){
    tc.responses[kind] = func;
}

tc.registerResponse('resource'
		    , function(request){
			tc.iconDir = request.data;
			tc.icons = { infoI : tc.iconDir + "/infoI.png"
				     ,greenG : tc.iconDir + "/greenG.png"
				     ,greenCheck : tc.iconDir + "/greenCheck.png"
				     ,redCirc : tc.iconDir + "/redCirc.png"
				     ,unitehere : tc.iconDir + "/unitehere.ico"
				     ,trackback16: tc.iconDir + "/trackback-16.png"
				     ,trackback32: tc.iconDir + "/trackback-32.png"};
		    });
// ick but need to keep in sync with icons directory
tc.iconStatus = {fair:	1,
change:	1,
ccan:	1,
cepr:	1,
ej:	1,
ips:	1,
ggw:	1,
alter:	1,
pih:	1,
cmj:	1,
color:	1,
itt:	1,
nation:	1,
eff:	1,
sob:	1,
soj:	1,
350:	1,
sbnyc:	1,
sbdc:	1,
sbla:	1,
sbsf:	1,
bitch:	1,
grist:	1,
prog:	1,
ucs:	1,
nrdc:	1,
fp:	1,
truthout:	1,
thinkprogress:	1,
truthdig:	1,
jwj:	1,
bust:	1,
fww:	1,
narco:	1,
pogo:	1,
pk:	1,
mj:	1,
saveinter:	1,
fmc:	1,
climprog:	1,
fpif:	1,
onearth:	1,
propublica:	1,
dom:	1,
acrj:	1,
qcopy:	1,
otherwords:	1,
splc:	1,
dwn:	1,
amazonwatch:	1,
dn:	1,
dnb:	1,
ledc:	1,
cotton:	1,
ctj:	1,
innocence:	1,
altoarizona:	1,
dcfpi:	1,
roc:	1,
feministing:	1
};

self.postMessage({'kind': 'resource'});
tc.getReverseHost = function(url){
    var host;
    var ar;
    if(host = url.split('/')[2]){
	ar = host.split('.');
	if(ar[0] == 'www'){
	    ar.shift();
	}
	if(ar.length <= 2){
	    return ar.join('.')
	} else {
	    return ar.slice(ar.length - 3).join('.')
	}
    }
    return null;
}

tc.onResponse = function(request){
    tc.responses[request.kind](request);
}

tc.sendMessage = function(request){
    self.postMessage(request);
}

tc.activeateResponses = function(){
    self.on('message',tc.onResponse);
}
tc.activeateResponses();
tc.registerExamine = function(func){
    tc.examines.push(func);
};

tc.insertPrev = function(n,iconName,title,text,pre,post){
    if(!n.previousSibling || !n.previousSibling.getAttribute || !n.previousSibling.getAttribute('subv')){ 
	var r = Math.floor(Math.random() * 100000);
	var resDiv = document.createElement("div");
	resDiv.setAttribute("id",r);
	resDiv.setAttribute("subv",true);
	resDiv.style.display = "inline";
	var imgG = document.createElement("img");
	imgG.src = tc.icons[iconName];
	resDiv.appendChild(imgG);
	if(pre)pre(n);
	n.parentNode.insertBefore(resDiv,n);
	n.style.display = "inline";
	tc.iconDialog(title,text,r);
	if(post)post(n);
    }
};


tc.popDialog = function(title, body, autoOpen){
    var r = Math.floor(Math.random() * 100000);
    var z = Math.floor(Math.random() * 100000);
    $('body').append('<img id="'+r+'" src="' + tc.icons.trackback32 + '" style="z-index:999999; position:fixed; bottom:125px; right:35px; display:inline; opacity:0.4">');

    var d = $('<div id="' + z + '">'+body+'</div>').dialog(
	{ title: 'thinkContext: ' + title
	  , position: [window.innerWidth - 350
		       , window.innerHeight - 175 ]
	  , close: function(){
	      $(window).unbind('resize');
	      $(window).unbind('scroll');
	  }
	  , height: 150
	  , autoOpen: autoOpen
	  , zIndex: 999999
	}); 
    
    $('div#' + z + ' a[tcstat]').click(function(){
	self.postMessage({'kind': 'sendstat'
	 			      , 'key': this.attributes['tcstat'].value});
    });
    $('#'+r).click(function(){
	d.dialog('open');
	$(window).resize(function(){
	    d.dialog({position: [window.innerWidth - 350
				 , window.innerHeight - 175 ]}); });
	$(window).scroll(function(){
	    d.dialog({position: [window.innerWidth - 350
				 , window.innerHeight - 175 ]}); });
    });
    $('#'+r).hover(function(){$(this).css('opacity','1.0')}
		   , function(){$(this).css('opacity','0.4')});
    
    $(window).resize(function(){
	d.dialog({position: [window.innerWidth - 350
			     , window.innerHeight - 175 ]}); });
    $(window).scroll(function(){
	d.dialog({position: [window.innerWidth - 350
			     , window.innerHeight - 175 ]}); });
}

tc.sigURL = function(url){
// turn a url into some sort of canonicalized version
// unfortunately this varies by site so this will be an imperfect exercise
    var ret = url;
    var matches;
    yt = new RegExp(/http:\/\/([^\.]+\.)?youtube.com\/watch\?.*(v=[^\&]*).*/);
    if(matches = yt.exec(ret)){
	ret = 'http://www.youtube.com/watch?' + matches[2];
	ret = ret.split('#')[0];	      
    } else if(ret.match(/http(s)?:\/\/(\w*\.)?abclocal\.go\.com/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?abcnews\.go\.com/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?thekojonamdishow\.org/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?businessday\.co\.za/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?bwint\.org/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?ctlawtribune\.com/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?interfax\.ru/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?ipsnews\.net/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?salon\.com/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?sfgate\.com/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?thehour\.com/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?npr\.org\/templates/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?washingtonpost\.com\/todays_paper/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?espn\.go\.com\/video\/clip/)	      
	      || ret.match(/http(s)?:\/\/(\w*\.)?cbsnews\.com\/video\/watch/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?washingtonpost\.com\/ac2\/wp-dyn/)
	      || ret.match(/http(s)?:\/\/(\w*\.)?dyn\.politico\.com\/printstory.cfm/)
	      || ret.match(/http(s)?:\/\/([\w\-\.])+\.gov\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*\.bloomberg\.com\/apps\/quote/)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*mobile\.washingtonpost\.com\/c\.jsp/)	     
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*businessweek\.com\//)	
	      || ret.match(/http(s)?:\/\/query\.nytimes\.com\//)     
	      || ret.match(/http(s)?:\/\/dealbook\.on\.nytimes\.com\/public\/overview/)     
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*google\.com\/url/)     
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*radioink\..com\//) 
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*scientificamerican\.com\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*wtop\.com\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*un\.org\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*sports\.espn\.go\.com\/espn\/espn25\/story/)
	      || ret.match('http://([\w\.]*\.)?wunderground\.com/[^"?]+')
	      || ret.match('http://([\w\.]*\.)?thefreshoutlook\.com/[^"?]+')
	      || ret.match('http://([\w\.]*\.)?phoenixnewtimes\.com/[^"?]+')
	      || ret.match('http://([\w\.]*\.)?int/[^"?]+')
	      || ret.match('http://([\w\.]*\.)?edu/[^"?]+')
	      || ret.match('http://([\w\.]*\.)?sports\.espn\.go\.com/espn/eticket/story[^"?]+')
	      || ret.match('http://([\w\.]*\.)?nymag\.com/print/[^"?]+')
	      || ret.match('http://([\w\.]*\.)?metroweekly\.com/news/[^"?]+')
	     ){
	ret = ret.split('#')[0];	      
    } else if(ret.match(/(\w*\.)?cbc.ca\/video/)
	      || ret.match(/(\w*\.)?cnn.com\/video\//)){
	ret = ret;
    } else if(ret.match(/^http(s)?:\/\/(\w*\.)*yahoo.com\//)){
	ret = ret.split('?')[0].split('#')[0].split(';')[0];	      
    } else {
	ret = ret.split('?')[0].split('#')[0];	      
    }
    return ret;
}

tc.htmlDecode = function(value){ 
  return $('<div/>').html(value).text(); 
}

tc.iconDialog = function(title,body,iconId){
    var d = $('<div id="d'+iconId+'">'+body+' </div>').dialog(
	{autoOpen: false
	 , title:  'thinkContext: ' + title
	 , height: 150
	 , zIndex: 999999
	}); 
    $("div#"+iconId ).hover(
	function(event){ 
	    d.dialog('option','position',[event.clientX - 15, event.clientY - 15]); 
	    d.dialog('open'); 
	    $('div:has(div#d'+iconId+')').mouseleave(function(e){ d.dialog('close'); });
	    return false;}
	, function(event){});
    $('div#d' + iconId+' a[tcstat]').click(function(){
	self.postMessage({'kind': 'sendstat'
	 			      , 'key': this.attributes['tcstat'].value});
    });
    tc.dialogs.push(d);
}

tc.intersect_safe = function(a, b)
{
  var ai=0, bi=0;
  var result = new Array();

  while( ai < a.length && bi < b.length )
  {
     if      (a[ai] < b[bi] ){ ai++; }
     else if (a[ai] > b[bi] ){ bi++; }
     else /* they're equal */
     {
       result.push(a[ai]);
       ai++;
       bi++;
     }
  }

  return result;
}

tc.reverseExamine = function(){
    var urlmap;
    urlmap = $("a[href^='http']:visible").map(function(){
	if(this.textContent.match(/\w/) && tc.sigURL(this.href) != tc.sigURL(document.URL)){
	    return tc.sigURL(this.href);
	}});
    if(urlmap){
	self.postMessage(
    	    {'kind': 'reversehome'
    	     , 'key': jQuery.makeArray(urlmap).slice(0,400)
    	    });
    }
}
tc.reverseResponse = function(request){
    var data = request.data;
    var out = {};
    var t;
    var docHost = tc.getReverseHost(document.baseURI);
    for(var i in data){
	t = data[i].reverse_link;
	if(docHost != tc.getReverseHost(data[i].link)){
	    if(!out[t]){
		out[t] = { }
	    }
	    out[t][data[i].link] = data[i];
	}
    }
    var tcstat = 'rrh';
	
    for(var rl in out){
	var text = '<b>This link was mentioned in</b>';// <ul style="display:inline">';

	for(l in out[rl]){
	    text += "<br>";
	    text += "<li>";
	    if(tc.iconStatus[out[rl][l].source] == 1){
		text += '<img style="display:inline;" height="16" width="16" src="'+tc.iconDir + "/" + out[rl][l].source + ".ico"+'">';
	}
	text += ' <a tcstat="' + tcstat + out[rl][l].id + docHost + '" target="_blank" href="' + out[rl][l].link + '">'+ tc.htmlDecode(out[rl][l].title) + '</a> by <a target="_blank" href="' + out[rl][l].source_link + '">' + out[rl][l].name + '</a> links to <a href="'+ out[rl][l].reverse_link + '">this page</a>'; 
	}
//	text += "</ul>";
	$('a[href^="'+rl+'"]:visible').map(function(){
	    if(!(this.previousSibling && this.previousSibling.getAttribute && this.previousSibling.getAttribute("subv"))){
		if(this.textContent.match(/\w/)){
		    var height = document.defaultView.getComputedStyle(this).getPropertyValue('font-size');
		    var resDiv = document.createElement("div");
		    var r = Math.floor(Math.random() * 100000);
		    resDiv.setAttribute("id",r);
		    resDiv.setAttribute("subv",true);
		    resDiv.style.display = "inline";
		    resDiv.style.height = height + "px";
		    resDiv.style.width = height + "px";;
		    var redih = document.createElement("img");
		    redih.src = tc.icons['trackback16'];
		    redih.style.height = height;// + "px";
		    redih.style.width = height;// + "px";
		    redih.style.margin = "1px";
		    redih.style.display = "inline";
		    resDiv.appendChild(redih);
		    this.parentNode.insertBefore(resDiv,this);
		    this.style.display = "inline";
		    tc.iconDialog("Progressive Trackback", text, r);
		}
	    }
	});
    }
}

tc.closeAllDialogs = function(){
    for(var d in tc.dialogs){
	tc.dialogs[d].dialog('close');
    }
}
