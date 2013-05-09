
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
    case 'pageA':
	chrome.pageAction.setIcon({tabId:sender.tab.id,path:request.icon});
	chrome.pageAction.show(sender.tab.id);
    }
};

chrome.pageAction.onClicked.addListener(
    function(tab){
	chrome.tabs.sendMessage(tab.id,{kind: 'tcPopD'});
    });

tc.connectSubvDB();
chrome.extension.onRequest.addListener(onRequest);
setInterval(function(){tc.updateTable('reverse')}, 3650000);
setInterval(tc.updateAllTables, 10870000);

// Check whether new version is installed
// chrome.runtime.onInstalled.addListener(
//     function(details){
// 	if(details.reason == "install"){
//             console.log("This is a first install!");
// 	}else if(details.reason == "update"){
//             var thisVersion = chrome.runtime.getManifest().version;
//             console.log("Updated from " + details.previousVersion + " to " + thisVersion + " + !");
// 	    chrome.tabs.create({url:"update.html"});
// 	}
//     });