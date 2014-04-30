
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
setInterval(tc.updateAllTables, 10870000);

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(
    function(details){
	if(details.reason == "install"){
	    chrome.tabs.create({url:"options.html?install"});
	}else if(details.reason == "update"){
	    chrome.tabs.create({url:"options.html?update"});
	}
    });
