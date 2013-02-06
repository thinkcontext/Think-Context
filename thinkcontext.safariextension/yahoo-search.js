//if window.top === window 
if(document.baseURI.search("http://.*search.yahoo.com/.*") >= 0 ){
sub = {

    insertSubvertisements: function(message){
    // var result= '';
    // var tcstat = 'yss';
    // console.log("insertSubvertisements");
    // console.log(message);
    // if(message.data && message.data.length > 0){
    // 	var subvs = message.data;
    // 	var sel = [];
    // 	var x = 0;
    // 	if(subvs.length > 3){
    // 	    for(x=0;x<=2;x++){
    // 		var i = tc.random()% subvs.length ;
    // 		sel.push(subvs[i]);
    // 		subvs.splice(i,1);
    // 	    }
    // 	} else {
    // 	    sel = subvs;
    // 	}
    // 	result = sel.map(function(subv){ 
    // 	    var d = JSON.parse(subv.data);
    // 	    var id = subv.id;
    // 	    var link = subv.url;
    // 	    var name = d.name;
    // 	    var ds = d.desc.split(' ')
    // 	    var blurb = ds.slice(0,14).join(' ');
    // 	    if(ds.length > 14)
    // 		blurb += '...';
    // 	    var host = link.split('/')[0];
    // 	    return '<li class="knavi"><h3><a tcstat="' + tcstat + id + '" target="_blank" href="http://' + link + '">'+ name + '</a></h3>' + blurb + '<br><div><cite>'+ host + '</cite></div></li>'; }).join(' ');
    // } 
    // $("div#right").map(function(){
    // 	if(result != ''){
    // 	    var subvDiv = document.createElement("div");
    // 	    subvDiv.setAttribute("subv",true);
    // 	    subvDiv.innerHTML = result;
    // 	    if(this.firstChild.getAttribute("subv") == null){
    // 		this.insertBefore(subvDiv,this.firstChild);
    // 	    } else {
    // 		this.replaceChild(subvDiv,this.firstChild);
    // 	    }
    // 	}});
    // $("div#right a[tcstat]").click(function(){
    // 	tc.sendMessage({'kind': 'sendstat'
    // 	 		, 'key': this.attributes['tcstat'].value});
    // });
    }
};

tc.registerResponse('yahoo-text',sub.insertSubvertisements);
tc.registerResponse('link',function(request){
    $("[sid=" + request.sid +"]").map(function(){
	tc.sub[request.data.func](this,request.key,request.data);});
});
tc.registerResponse('place', function(request){
    $("[sid=" + request.sid +"]").map(function(){
	tc.sub[request.data.func](this,request.key,request.data);});
}
			     );

// query text
var qt =  $("input[name=p]").val();
//location
//var loc = $('ul.sw_tn > li:nth-child(3) > a').text()
//debug("qt " + qt + " loc " + loc);
tc.sendMessage(
    {'kind' : "yahoo-text"
      , 'key' : qt
      //      , 'location' : loc
     });

// result link - could be a place link else look up the result link
$('div#web > ol h3 > a').map(
    function(){
    	if(!this.previousSibling || !this.previousSibling.getAttribute || !this.previousSibling.getAttribute('subv')){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    var yid_regex = new RegExp('local.yahoo.com/info-([0-9]+)');
    	    yid_res = yid_regex.exec(this.href);
	    if(yid_res && yid_res[1]){
		var yid = yid_res[1];
		tc.sendMessage({'kind': 'place'
				, 'sid': sid
				, 'type': 'yahoo'
				, 'key': yid  });
	    } else {
		this.setAttribute("sid",sid);
		tc.sendMessage({'kind': 'link'
     				, 'sid': sid
     				, 'key': tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'') });
	    }
	}
    });

tc.registerResponse('reversehome', tc.reverseResponse);
tc.reverseExamine();
    safari.self.addEventListener("message",tc.onResponse, false);
    
}
//}