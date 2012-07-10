tc.googlePlaceResponse = function(request){

    var sub = {
	place: function(data,type){
	    var title;
	    var tcstat = 'gpp' + data.id;
	    var message;
	    if(type == 'boycott'){
		title = '<img src="'+ tc.icons['redCirc'] + '"> Boycott';
	    message = '<a tcstat="'+tcstat+'" target="_blank" href="http://www.hotelworkersrising.org">Hotel Workers Rising</a> recommends boycotting this establishment';
	    } else if(type == 'patronize'){
		title = '<img src="'+ tc.icons['greenCheck'] + '"> Patronize';
		message = '<a tcstat="'+tcstat+'" target="_blank" href="http://www.hotelworkersrising.org">Hotel Workers Rising</a> recommends patronizing this establishment';
	    } else if(type == 'risky'){
		title = 'Risky';
		message = '<a tcstat="'+tcstat+'" target="_blank" href="http://www.hotelworkersrising.org">Hotel Workers Rising</a> advises that there is a risk of a labor dispute at this establishment';
	    }
	    
	    tc.popDialog(title,message,true);
	}
	, placeboycott: function(data){
	    sub.place(data,'boycott');
	}
	, placestrike: function(data){
	    sub.place(data,'boycott');
	}
	, placesafe: function(data){
	    sub.place(data,'patronize');
	}
	, placerisky: function(data){
	    sub.place(data,'risky');
	}
    };

    sub['place'+request.data.type](request.data);
};

tc.registerResponse('place', tc.googlePlaceResponse);

tc.googlePlaceExamine = function(){

    var cid_regex = new RegExp('plus.google.com/([0-9]+)');
    var cid_res = cid_regex.exec(document.URL);
    if(cid_res[1]){
	tc.sendMessage(
	    {'kind': 'place'
	     , 'type': 'google'
	     , 'subtype': 'gp-cid'
	     , 'key': cid_res[1]});
    }
};

tc.googlePlaceExamine();