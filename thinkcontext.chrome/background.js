function onRequest(request, sender, callback) {
    var key = request.key;
    var data;
    switch(request.kind){
    case 'link': 
	tc.lookupResult(key, request, callback);
	break;
    case 'place':
        tc.lookupPlace(key,request,callback);
	break;
    case 'places':
        tc.lookupPlaces(request,callback);
	break;
    // case 'yahoo-text':
    // case 'gs-text':
    // case 'bing-text':
    // 	tc.lookupSubvert(request.key, request, callback);
    // 	break;
    case 'reverse':
        tc.lookupReverse(request.key,request,callback);
        break;
    case 'reversehome':
        tc.lookupReverseHome(request.key,request,callback);
        break;
    case 'sendstat':
        tc.sendStat(request.key);
        break;
    case 'urlresolve':
	tc.urlResolve(request, callback);
	break;
    }
};

chrome.webRequest.onBeforeRequest.addListener(
    function(req){
	console.log(req);
	if(req.type != 'xmlhttprequest'){
	    $.getJSON(req.url, null
		      , function(data, textStatus){
			  console.log(data);
			  tc.addBP(data,req.url);			  
		      });
	}
    }
    ,{urls: ["*://boycottplus.org/*.bcp"]}
);
tc.connectSubvDB();
chrome.extension.onRequest.addListener(onRequest);
setInterval(function(){tc.updateTable('reverse')}, 3650000);
setInterval(tc.updateAllTables, 10870000);
