tc.debug("google finance page");

tc.registerResponse('gp-finance'
			      ,function(request){
				  tc.debug("google finance page onResponse");
				  tc.debug(request);
				  var data = JSON.parse(request.data.data);
				  var tcstat = 'gfx' + request.data.id;
				  var supporters = data['Supporters'].join(' ')
				  var message = 'This company has an upcoming proxy vote. ' + supporters + ' have an opionion on the vote.  <a tcstat="'+tcstat+'" target="_blank" href="' + data['BallotUrl'] + '">More info</a>';
				  tc.popDialog("Proxy Vote Info", message);
			      });
tc.registerResponse('reversehome', tc.reverseResponse);
tc.reverseExamine();
$("a#gb_1").map(
    function(){
	var stockRegexp = new RegExp('q=([A-Z:]+)');
	var stockRes = stockRegexp.exec(this.href);
	if(stockRes && stockRes[1]){
	    tc.sendMessage(
		{'kind': 'gp-finance'
		 , 'key': stockRes[1]});
	}
    });

