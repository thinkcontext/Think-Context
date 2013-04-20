tc = {
    optVal: function(o){ return localStorage[o];}
    
    , dbName: 'thinkcontext'
    , tables: {
	source: {
	    fields: {
		id: 'integer primary key'
		, source: 'text'
		, name: 'text'
		, link: 'text'
	    }
	    , version: '0.06'
	    , opt : 'opt_news'
	}
	, reverse: {
	    fields: {
		id: 'integer primary key'
		, source: 'text'
		, reverse_link: 'text'
		, title: 'text'
		, link: 'text'
	    }
	    , opt: 'opt_news'
	    , version: '0.07'
	}
	, results: { 
	    fields: {
		id:'integer primary key'
		, key: 'text'
		, url: 'text'
		, func: 'text'
		, data: 'text'
	    }
	    , version: '0.08'
	}
	// , subverts: { 
	//     fields: {
	// 	id: 'integer'
	// 	, sdid: 'integer'
	// 	, txt: 'text'
	// 	, location: 'text'
	// 	, bin_op: 'text'
		
	//     }
	//     , version: '0.02'
	// }
	, place: {
	    fields: {
		id: 'integer'
		, pdid: 'integer'
		, type: 'text'
		, siteid: 'text'
	    }
	    , opt: 'opt_hotel'
	    , version: '0.07'
	}
	, place_data: {
	    fields: {
		id: 'integer primary key'
		, data: 'text'
		, type: 'text'
	    }
	    , opt: 'opt_hotel'
	    , version: '0.07'
	}
    }

    , dataUrl: 'http://thinkcontext.azurewebsites.net/tc.php?'

    , tableFieldsLength: function(t){
	var i = 0;
	for(var x in tc.tables[t].fields){
	    i++;
	}
	return i;
    }

    , tableFields: function(t){
	var r = '';
	for(var f in tc.tables[t].fields){
	    if(r == ''){
		r = f;
	    } else {
		r+=", " + f;
	    }
	}
	return r;
    }

    , tableFieldsTypes: function(t){
	var r = '';
	for(var f in tc.tables[t].fields){
	    if(r == ''){
		r = f + " " + tc.tables[t].fields[f];
	    } else {
		r+=", " + f + " " + tc.tables[t].fields[f];
	    }
	}
	return r;
    }

    , simpleSql: function(sqlTxt){
	tc.db.transaction(
	    function(tx){
		tx.executeSql(sqlTxt,[]);
	    });
    }

    , checkLocalTableVersion: function(t){
	return localStorage.getItem(t + 'version') == tc.tables[t].version;
    }
    , setLocalTableVersion: function(t){
	localStorage.setItem(t + 'version', tc.tables[t].version);
    }
    , removeLocalTableVersion: function(t){
	localStorage.removeItem(t + 'version');
    }
    , checkLocalDeleteTime: function(t){
	return localStorage.getItem(t + 'deletetime');
    }
    , setLocalDeleteTime: function(t){
	var d = new Date;
	// round down to the hour to improve cacheability
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);
	localStorage.setItem(t + 'deletetime', d.getTime());
    }
    , checkLocalAddTime: function(t){
	return localStorage.getItem(t + 'addtime');
    }
    , setLocalAddTime: function(t){
	var d = new Date;
	// round down to the hour to improve cacheability
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);
	localStorage.setItem(t + 'addtime', d.getTime());
    }
    , initializeLocalDB: function(){
	if(!tc.loadAllTables()){
	    //console.log('Database init failed!'); // todo notify the user or try again later
	}
    }
    , connectSubvDB: function(){
	if(tc.db = openDatabase(tc.dbName, '1.0', tc.dbName, 20*1024*1024)){
	    tc.loadAllTables(); // see if tables at least are the right version
	    setTimeout(tc.updateAllTables,10000); // do at idle?
	}
    }

    , onSuccess: function(tx,r){	
	//console.log("success");
    }
    
    , onError: function(tx,e){
	//console.log("db error: " + e.message);
    }
    
    , loadAllTables: function(){
	if(tc.optVal('opt_hotel') == 0)
	    tc.simpleSql("delete from results where func like 'hotel%'");
	if(tc.optVal('opt_rush') == 0)
	    tc.simpleSql("delete from results where func = 'rushBoycott'");
	if(tc.optVal('opt_green') == 0)
	    tc.simpleSql("delete from results where func = 'greenResult'");
	var t;
	for(t in tc.tables){
	    if(! (tc.optVal(tc.tables[t].opt) == 0)){
		if(!tc.checkLocalTableVersion(t)){
		    tc.loadTable(t);
		} else {
		    tc.checkNoTable(t);
		}
	    } else {
		var delTxt = "delete from " + t;
		tc.removeLocalTableVersion(t);
		tc.simpleSql(delTxt);
	    }
	}
    }
    
    , checkNoTable: function(table){
	tc.db.transaction(
	    function(tx){
		tx.executeSql("select count(*) from " + table
			      ,[]
			      ,null
			      ,function(){ tc.loadTable(table) })});
    }
    , updateAllTables: function(){
	for(var t in tc.tables){
	    if(! (tc.optVal(tc.tables[t].opt) == 0)){
		var secs = tc.checkLocalDeleteTime(t);
		if( (! secs) || ((Date.now() - Number(secs)) > 1800000))
		    tc.updateTable(t);
	    }
	}
    }
    
    , updateTable: function(table){
	var resClause = '';
	var resArr = [];
	if(table == 'results'){
	    if(tc.optVal('opt_green') == 0)
		resArr.push("greenResult");
	    if(tc.optVal('opt_rush') == 0)
		resArr.push("rushBoycott");
	    if(tc.optVal('opt_hotel') == 0)
		resArr.push("hotelsafe");
		resArr.push("hotelstrike");
		resArr.push("hotelrisky");
		resArr.push("hotelboycott");
	}
	if(resArr.length > 0){
	    resClause = "&ex=" + resArr.join(',');
	}

	var dateClause = '';
	var secs;

	if(secs=tc.checkLocalDeleteTime(table)){
	    dateClause = "&dm= " + secs;
	}

	var query  = encodeURI(tc.dataUrl + "tab=" + table + dateClause + resClause);

	$.get(query,{},function(data){
	    var dataArray = CSVToArray(data);
	    if(dataArray.length > 1){ // see if there's any data to insert
		tc.db.transaction(
		    function(tx){
			var deleteTxt = "DELETE FROM " + table + " WHERE id = ? ";
			dataArray = dataArray.slice(1);
			for (var r in dataArray){
			    tx.executeSql(deleteTxt
					  , dataArray[r], function(){tc.setLocalDeleteTime(table);}, tc.onError);
			}
		    }
		);
	    }
	});

	dateClause = '';
	if(secs=tc.checkLocalAddTime(table)){
	    dateClause = "&da= " + secs;
	}

	query = encodeURI(tc.dataUrl + "tab=" + table + dateClause + resClause);

	$.get(query,{},function(data){
	    var dataArray = CSVToArray(data);
	    var len = tc.tableFieldsLength(table);
	    if(dataArray.length > 1 && dataArray[0].length == len){ // see if there's any data to insert and the number of fields is right
		tc.db.transaction(
		    function(tx){
			dataArray = dataArray.slice(1);
			for (var r in dataArray){
			    if(dataArray[r].length == len){
				var insertTxt = "INSERT OR REPLACE INTO " + table + "( " + tc.tableFields(table) + ") VALUES ( " + "?" + ",?".repeat(tc.tableFields(table).split(',').length - 1) + ") ";
				tx.executeSql(insertTxt
					      , dataArray[r]
					      , function(){tc.setLocalTableVersion(table);
							   tc.setLocalAddTime(table);}
					      , tc.onError
					     );
			    }
			}
		    }
		);
	    }
	});
    }
    
    , loadTable: function(table){
	var query;
	var resClause = '';
	var resArr = [];
	if(table == 'results'){
	    if(tc.optVal('opt_green') == 0)
		resArr.push("greenResult");
	    if(tc.optVal('opt_rush') == 0)
		resArr.push("rushBoycott");
	    if(tc.optVal('opt_hotel') == 0)
		resArr.push("hotelsafe");
		resArr.push("hotelstrike");
		resArr.push("hotelrisky");
		resArr.push("hotelboycott");
	}
	if(resArr.length > 0){
	    resClause = "&ex=" + resArr.join(',');
	}

	query = encodeURI(tc.dataUrl + "da=0&tab=" + table + resClause);
	$.get(query,{},function(data){
	    var dataArray = CSVToArray(data);
	    var len = tc.tableFieldsLength(table);
	    if(dataArray.length > 1 && dataArray[0].length == len){ // see if there's any data to insert and the number of fields is right
		tc.db.transaction(
		    function(tx){
			var createBP;
			var dropTxt = "DROP TABLE IF EXISTS " + table;
			var createTxt = "CREATE TABLE " + table +"( " + tc.tableFieldsTypes(table) + " )";
			if(table == 'results'){
			    createBP = "CREATE TABLE if not exists bp_results ( " + tc.tableFieldsTypes(table) + " )";
			    tx.executeSql(createBP
					  , []
					  , tc.onSuccess, tc.onError);
			}

			var insertTxt = "INSERT OR REPLACE INTO " + table + "( " + tc.tableFields(table) + ") VALUES ( " + "?" + ",?".repeat(tc.tableFields(table).split(',').length - 1) + ") ";
			tx.executeSql(dropTxt,[]
				      , tc.onSuccess, tc.onError);
			tx.executeSql(createTxt
				      , []
				      , tc.onSuccess, tc.onError);
			dataArray = dataArray.slice(1);
			for (var r in dataArray){
			    if(dataArray[r].length == len){
				tx.executeSql("INSERT OR REPLACE INTO " + table + "( " + tc.tableFields(table) + ") VALUES ( " + "?" + ",?".repeat(tc.tableFields(table).split(',').length - 1) + ") " 
					      , dataArray[r], function(){tc.setLocalTableVersion(table);tc.setLocalAddTime(table);tc.setLocalDeleteTime(table)}, tc.onError);
			    }
			}
		    }
		);
	    }
	});
    }
    
    , onLookupSuccessMany: function(tx, r, request, callback){
	if(r.rows.length > 0){
	    request.data = [];
	    for(var i=0;i<r.rows.length;i++){
		request.data[i]=r.rows.item(i);
	    }
	    callback(request);
	}
    }
    , onLookupSuccess: function(tx, r, request, callback){
	if(r.rows.length > 0){
	    request.data = r.rows.item(0);;
	    callback(request);
	}
    }

    , onLookupResultSuccess: function(tx, r, request, callback){
	var x;
	if(r.rows.length > 0){
	    request.data = r.rows.item(0);;
	    switch(tc.optVal('opt_popD')){
	    case 'never':
		request.popD = false;
		break;
	    case 'every':
		request.popD = true;
	    case 'session':
		if(! sessionStorage.getItem('tcPopD_' + request.data.key)){
		    request.popD = true;
		    sessionStorage.setItem('tcPopD_' + request.data.key,1);
		} else {
		    request.popD = false;
		}
		break;
	    default:
		if(! localStorage.getItem('tcPopD_' + request.data.key)){
		    request.popD = true;
		    localStorage.setItem('tcPopD_' + request.data.key,1);
		} else {
		    request.popD = false;
		}		
	    }

	    callback(request);
	}
    }

    , lookupResult: function(key, request, callback){
	tc.db.transaction(
	    function(tx){
		var selTxt = "select * from (SELECT * FROM results WHERE ? = key or ? like key || '/%' or ? like '%.' || key || '/%' or ? like '%.' || key union SELECT * FROM bp_results WHERE ? = key or ? like key || '/%' or ? like '%.' || key || '/%' or ? like '%.' || key) t LIMIT 1";
		tx.executeSql(selTxt
			      , [key,key,key,key,key,key,key,key]
			      , function(tx,r){ 
				  tc.onLookupResultSuccess(tx,r,request, callback);
			      }
			      , tc.onError);
	    }
	);
    }
    , lookupPlace: function(key,request,callback){
	tc.db.transaction(
	    function(tx){
		var selTxt = "SELECT pd.id, pd.type FROM place p inner join place_data pd on pd.id = p.pdid WHERE siteid = ? and p.type = ? LIMIT 1";
		tx.executeSql(selTxt
			      , [key,request.type]
			      , function(tx,r){ 
				  tc.onLookupSuccess(tx,r,request, callback)
			      }
			      , tc.onError);
	    }
	);
    }
    , lookupPlaces: function(request,callback){
	var data = request.data;
	var i;
	var inStmt = "('" + request.data.map(function(x){ return x.cid }).join("' , '") + "')";
	
	tc.db.transaction(
	    function(tx){
		var selTxt = "SELECT p.siteid, pd.id, pd.type FROM place p inner join place_data pd on pd.id = p.pdid WHERE siteid in " + inStmt +" and p.type = ?";
		tx.executeSql(selTxt
			      , [request.type]
			      , function(tx,r){tc.onLookupSuccessMany(tx,r,request,callback)}
			      , tc.onError);
	    }
	);
    }

    , lookupReverse: function(key,request,callback){
	// find reverse links and some other links to the same site
	var host = getReverseHost(key);
	var selTxt = "select distinct min(id) id, s, title, link, reverse_link, name, source, source_link from ( SELECT 'exact' s,r.id, reverse_link, title, r.link, s.name, s.source, s.link source_link FROM reverse r left outer join source s on s.source = r.source WHERE reverse_link = ? union SELECT 'not exact',r.id, r.reverse_link, r.title, r.link, s.name, s.source, s.link source_link FROM reverse r left outer join source s on s.source = r.source left outer join ( SELECT 'exact' s,r.id, r.reverse_link, title, r.link, s.name, s.link source_link FROM reverse r left outer join source s on s.source = r.source WHERE r.reverse_link = ? ) o on o.link = r.link WHERE ( r.reverse_link like 'http://%.'||?||'/%' or r.reverse_link like 'http://'||?||'/%' ) and r.reverse_link <> ? and o.link is null ) t group by s, title, link, name, source, source_link order by s, id desc limit 5;"
	tc.db.transaction(
	    function(tx){
		tx.executeSql(selTxt
			      , [key,key,host,host,key]
			      , function(tx,r){ 
				  tc.onLookupSuccessMany(tx,r,request, callback)
			      }
			      , tc.onError);
	    });
    }

    , lookupReverseHome: function(key,request,callback){
	var parSt;
	for(var i in key){
	    if(i == 0)
		parSt = "?";
	    else 
		parSt += ",?";
	}
	
	var selTxt = "SELECT distinct min(r.id) id, 'exact' s, reverse_link, title, r.link, s.source, s.name, s.link source_link FROM reverse r left outer join source s on s.source = r.source WHERE reverse_link in (" + parSt + ") group by 'exact', reverse_link, title, r.link, s.source, s.name, s.link";
	request.key = '';
	tc.db.transaction(
	    function(tx){
		tx.executeSql(selTxt
			      , key
			      , function(tx,r){ 
				  tc.onLookupSuccessMany(tx,r,request, callback)
			      }
			      , tc.onError);
	    });
    }


    // , lookupSubvert: function(key, request, callback){
    // 	tc.db.transaction(
    // 	    function(tx){
    // 		var selTxt = "select sd.id, data, url from subverts s join results sd on sd.id = s.sdid where s.txt = ? ";
    // 		tx.executeSql(selTxt
    // 			      , [key]
    // 			      , function(tx,r){ 
    // 				  tc.onLookupSuccessMany(tx,r,request, callback)
    // 			      }
    // 			      , tc.onError);
    // 	    });
    // }

    , sendStat: function(key){
	$.get('http://thinkcontext.org/s/?' + key);
    }

    , urlResolve: function(request,callback){
	var s = request.key.split('/');
	if(s.length > 3){
	    var domain = s[2];
	    if(bitlyDomain(domain)){
		$.get( request.key + '+'
		       , function(r){
			   var h = r.match(/h1 id="item_title"><a href="([^"]+)"/);
			   if(h){
			       request.url = h[1];
			       callback(request);
			   }
		       }
		     );
		
	    } else if(domain == 'goo.gl'){
		$.getJSON('https://www.googleapis.com/urlshortener/v1/url?shortUrl='+request.key
			  , function(data){
			      request.url = data.longUrl;
			      callback(request);
			  });
	    }
	}
    }

    , addBP: function(data, campUrl){
	var name = data.name, updatedDate = data.updatedDate, sponsorUrl = data.sponsorUrl, company, domain, dat;
	if(name && updatedDate && data.company.length > 0 && data.company[0].domains.length > 0){
	    tc.db.transaction(
		function(tx){
		    tx.executeSql("delete from bp_results where url = ?",[campUrl],null,null);
		    for(var c in data.company){
			company = data.company[c];
			for(var d in company.domains){
			    domain = company.domains[d].toLowerCase().replace('http://','').replace('www.','');

			    dat = {updatedDate:updatedDate
				   , blurb: company.causeDetail
				   , name: name
				   , companyName: company.companyName
				   , sponsorUrl: sponsorUrl}

			    tx.executeSql(
				"insert into bp_results ( key, url, func, data) values ( ?, ?, ?, ? )"
				, [domain,campUrl,'bp', JSON.stringify(dat)]
				, null, tc.onError);
			    
			}
		    }
		});
	}
    }

    , setBPTime: function(t){
	localStorage.setItem('bpLastRefresh', t);
    }

    , getBPTime: function(){
	return localStorage.getItem('bpLastRefresh');
    }
    
    , refreshBPs: function(){
	if(tc.getBPTime() == null || (Date.now() - tc.getBPTime() > 3600000 * 36)){
	    tc.db.transaction(
		function(tx){
		    tx.executeSql(
			"select distinct url from bp_results",[]
			, function(tx,r){
			    if(r.rows.length>0){
				for(var i=0;i<r.rows.length;i++){
				    var url = r.rows.item(i).url
				    $.getJSON(url, null
					      , function(data, textStatus){
						  tc.addBP(data,url);
						  tc.setBPTime(Date.now());
					      }
					     );
				}}}
			, null);
		});	
	}
    }
    , listBPs: function(callback){
	tc.db.transaction(
	    function(tx){
		tx.executeSql(
		    "select url,min(data)data from bp_results group by url",[]
		    , function(tx,r){
			var out = [];
			if(r.rows.length>0){
			    for(var i=0;i<r.rows.length;i++){
				out.push(r.rows.item(i));
			    }
			}
			callback(out);			
		    }
		    , null);		
	    });	
    }

    , rmBP: function(url){
	tc.db.transaction(
	    function(tx){
		tx.executeSql(
		    "delete from bp_results where url = ?", [url]
		);
	    });	
    }
};
