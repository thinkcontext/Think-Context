var tc = {};

tc.onResponse = function(request){
    console.log('onResponse',request);
}
tc.sendMessage = function(request){
    console.log('sendMessage',request);
    chrome.extension.sendRequest(request, tc.onResponse);
}

tc.handlify = function(htype,raw){
    switch(htype){
    case 'congressText':
	
	
	break;
    }
}

tc.uniqueArray = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};
tc.random = function(){return Math.floor(Math.random() * 100000);}
