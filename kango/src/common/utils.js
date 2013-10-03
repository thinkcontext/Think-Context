tc = {};
tc.random = function(){return Math.floor(Math.random() * 100000);}
tc.sendMessage = function(msg){
    console.log(msg);
    kango.dispatchMessage('content2background',msg)
};

tc.sigURL = function(url){
    // turn a url into some sort of canonicalized version
    // unfortunately this varies by site so this will be an imperfect exercise
    var ret = url;
    var matches;
    var yt = new RegExp(/http(s)?:\/\/([^\.]+\.)?youtube.com\/watch\?.*(v=[^\&]*).*/);
    if(matches = yt.exec(ret)){
	ret = 'http://www.youtube.com/watch?' + matches[3];
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
