tc = {};
tc.random = function(){return Math.floor(Math.random() * 100000);}
tc.sendMessage = function(msg){kango.dispatchMessage('content2background',msg)};

tc.sigURL = function(url){
    // turn a url into some sort of canonicalized version
    // unfortunately this varies by site so this will be an imperfect exercise
    var ret = url;
    var matches;
    var yt = new RegExp(/http(s)?:\/\/([^\.]+\.)?youtube.com\/watch\?.*(v=[^\&]*).*/);
    if(matches = yt.exec(ret)){
	ret = 'http://www.youtube.com/watch?' + matches[3];
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
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*wunderground\.com\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*thefreshoutlook\.com\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*phoenixnewtimes\.com\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*int\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*edu\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*sports\.espn\.go\.com\/espn\/eticket\/story\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*nymag\.com\/print\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*metroweekly\.com\/news\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*defensenews\.com\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*msmagazine\.com\/news\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*unep\.org\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*lamag\.com\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*9news\.com\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*oecd\.org\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*archives\.newyorker\.com\//)
	      || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*select\.nytimes\.com\//)
	      || ret.match(/http(s)?:\/\/([\w\.]*\.)?govtrack\.us\/[^"?]+/)
	      || ret.match(/http(s)?:\/\/([\w\.]*\.)?markets\.ft\.com\/[^"?]+/)
	      || ret.match(/http(s)?:\/\/([\w\.]*\.)?irinnews\.org\/[^"?]+/)
	      || ret.match(/http(s)?:\/\/([\w\.]*\.)?jpost\.com\/[^"?]+/)	
	      || ret.match(/http(s)?:\/\/([\w\.]*\.)?cato\.org\/[^"?]+/)
	      || ret.match(/http(s)?:\/\/([\w\.]*\.)?wtop\.com\/[^"?]+/)
	      || ret.match(/http(s)?:\/\/([\w\.]*\.)?money\.msn\.com\/[^"?]+/)
	      || ret.match(/http(s)?:\/\/([\w\.]*\.)?npr\.org\/player\/v2\/mediaPlayer\.html[^"?]+/)	     
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
