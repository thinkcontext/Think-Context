tc.googlePlaceResponse = function(request){
    var sub = {
	place: function(d,type){
	    var title;
	    var r = Math.floor(Math.random() * 100000);    
	    var tcstat = 'gpp' + d.id;
	    var blurb;
	    var icon;
	    if(d.type == 'safe'){
		icon = 'greenCheck';
		title = ' Patronize This Hotel';
		blurb = $('<div>')
		    .append($('<b>')
			    .append($('<a>', {tcstat:tcstat + d.id
					      , target:"_blank"
					      , href: "http://www.hotelworkersrising.org/"
					      , text: "Hotel Workers Rising"
					     })))
		    .append(' - Recommends patronizing this hotel');
	    } else if(d.type == 'boycott' || d.type == 'strike'){
		icon = 'redCirc';
		title = ' Boycott This Hotel';
		blurb = $('<div>')
		    .append($('<b>')
			    .append($('<a>', {tcstat:tcstat + d.id
					      , target:"_blank"
					      , href: "http://www.hotelworkersrising.org/"
					      , text: "Hotel Workers Rising"
					     })))
		    .append(' - Recommends boycotting this hotel');
	    } else if(d.type == 'risky'){
		icon = 'infoI';
		title = 'Risk of Labor Dispute At This Hotel';
		blurb = $('<div>')
		    .append($('<b>')
			    .append($('<a>', {tcstat:tcstat + d.id
					      , target:"_blank"
					      , href: "http://www.hotelworkersrising.org/"
					      , text: "Hotel Workers Rising"
					     })))
		    .append(' advises that there is a risk of a labor dispute at this hotel.');
	    }
	    
	    tc.popDialog(title,blurb,r,true);
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