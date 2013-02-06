var sql = require("sqlite");
var Request = require('request').Request;
var ss = require("simple-storage");
var timer = require("timer");

var prefSet = require("simple-prefs");
var opt_news = prefSet.prefs.opt_news;
var opt_green = prefSet.prefs.opt_green;
var opt_rush = prefSet.prefs.opt_rush;
var opt_hotel = prefSet.prefs.opt_hotel;

function onPrefChange(prefName) {  
    // 'results' is a shared table so we have to always refresh 
    tc.removeLocalTableVersion('results');
    prefSet.prefs[prefName]; 
    tc.loadAllTables();
}
prefSet.on('opt_news', onPrefChange);
prefSet.on('opt_green', onPrefChange);
prefSet.on('opt_rush', onPrefChange);
prefSet.on('opt_hotel', onPrefChange);

function bindNums(x){
    var ret = [];
    for(var i = 0; i<x; i++){
	ret.push(":" + i.toString());
    }
    return ret.join(',');    
}

function bindArr(arr){
    var ret = {};
    for(var i = 0; i<arr.length; i++ ){
	ret[i.toString()] = arr[i];
    }
    return ret;    
}

tc = {
    dbName: 'thinkcontext'
    , tables: {
	source: {
	    fields: {
		id: 'integer primary key'
		, source: 'text'
		, name: 'text'
		, link: 'text'
	    }
	    , googFTNumber: '16npeDRrzx9J6X4P4w2KplYwF9wPmSrLEZSQdiBE' //1040216'
	    , opt : 'opt_news'
	    , version: '0.05'
	}
	, reverse: {
	    fields: {
		id: 'integer primary key'
		, source: 'text'
		, reverse_link: 'text'
		, title: 'text'
		, link: 'text'
	    }
	    , googFTNumber: '1yQubKSeSyz2VJHmDLxIdnuuR8zRgQbcE6gtJRkE' //1049740'
	    , opt : 'opt_news'
	    , version: '0.06'
	}
	, results: { 
	    fields: {
		id:'integer primary key'
		, key: 'text'
		, url: 'text'
		, func: 'text'
		, data: 'text'
	    }
	    , googFTNumber: '1C2ITzdKi1ZPTRuOLsFZzzNMEN9IwDrGdsUxXYsc'
	    , version: '0.06'
	}
	// , subverts: { 
	//     fields: {
	// 	id: 'integer'
	// 	, sdid: 'integer'
	// 	, txt: 'text'
	// 	, location: 'text'
	// 	, bin_op: 'text'
		
	//     }
	//     , googFTNumber: '1nUKzssNvuZobPqb7fglzfLHI4GObMY1f3dyHs6g' //2038549' 
	//     , version: '0.02'
	// }
	, place: {
	    fields: {
		id: 'integer'
		, pdid: 'integer'
		, type: 'text'
		, siteid: 'text'
	    }
	    , googFTNumber: '1H38qhAMz280fqktszJRVyAtHuS0OBdcsC7-WZsE'
	    , opt: 'opt_hotel'
	    , version: '0.06'
	}
	, place_data: {
	    fields: {
		id: 'integer primary key'
		, data: 'text'
		, type: 'text'
	    }
	    , googFTNumber: '10TYcA0TD-DdArVh5oYxq9KdwBJa0WCin6GNnV8Y'
	    , opt: 'opt_hotel'
	    , version: '0.06'
	}
    }
    , optVal: function(o){ return prefSet.prefs[o]; }

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

    , googFT : 'https://www.googleapis.com/fusiontables/v1/query?key=AIzaSyDZ28Q_ZRg6SXUEVsR-AqRbyIJdoE0qGYg&alt=csv&sql='

    , checkLocalTableVersion: function(t){
	return ss.storage[t + 'version'] == tc.tables[t].version;
    }
    , setLocalTableVersion: function(t){
	ss.storage[t + 'version'] = tc.tables[t].version;
    }
    , removeLocalTableVersion: function(t){
	ss.storage[t + 'version'] = null;
    }
    , checkLocalDeleteTime: function(t){
	return ss.storage[t + 'deletetime'];
    }
    , setLocalDeleteTime: function(t){
	var d = new Date;
	ss.storage[t + 'deletetime'] = d.getTime();
    }

    , checkLocalAddTime: function(t){
	return ss.storage[t + 'addtime'];
    }
    , setLocalAddTime: function(t){
	var d = new Date;
	ss.storage[t + 'addtime'] = d.getTime();
    }

    , initializeLocalDB: function(){
	if(!tc.loadAllTables()){
	    //console.log('Database init failed!'); // todo notify the user or try again later
	}
    }

    , connectDB: function(){
	sql.connect(tc.dbName);
    }

    , onSuccess: function(tx,r){
	//console.log("success");
    }
    
    , onError: function(tx,e){
	//console.error("db error: " + e.message);
	//console.error("fail");
    }
    
    , loadAllTables: function(){
	if(tc.optVal('opt_hotel') == false)
	    sql.execute("delete from results where func like 'hotel%'");
	if(tc.optVal('opt_rush') == false)
	    sql.execute("delete from results where func = 'rushBoycott'");
	if(tc.optVal('opt_green') == false)
	    sql.execute("delete from results where func = 'greenResult'");
	
	for(var t in tc.tables){
	    if(! (tc.optVal(tc.tables[t].opt) == false)){
		if(!tc.checkLocalTableVersion(t)){
		    tc.loadTable(t);
		} else {
		    tc.checkNoTable(t);
		}
	    } else {
		var delTxt = "delete from " + t;
		tc.removeLocalTableVersion(t);
		sql.execute(delTxt);
	    }
	}
    }
    , checkNoTable: function(table){
	sql.execute("select count(*) from " + table
		    ,{}
		    , tc.onSuccess
		    , function(e,stmt){ tc.loadTable(table)});	
    }
    , updateAllTables: function(){
	for(var t in tc.tables){
	    if(! (tc.optVal(tc.tables[t].opt) == false))
		tc.updateTable(t);
	}
    }
    
    , updateTable: function(table){
	var resClause = '';
	if(table == 'results'){
	    if(tc.optVal('opt_green') == false)
		resClause += " and func not equal to 'greenResult' ";
	    if(tc.optVal('opt_rush') == false)
		resClause += " and func not equal to 'rushBoycott' ";
	    if(tc.optVal('opt_hotel') == false)
		resClause += " and func does not contain 'hotel' ";
	}

	var len = tc.tableFieldsLength(table);
	var dateClause = '';
	var secs;
	if(secs=tc.checkLocalDeleteTime(table)){
	    dateClause = "and dm >= " + secs;
	}

	var delQuery  = encodeURI(tc.googFT + "SELECT id FROM " + tc.tables[table].googFTNumber + " WHERE status not equal to 'A' " + dateClause + resClause + " limit 100000");
	var delReq = Request({
	    url: delQuery
	    ,onComplete: function(response){
		var dataArray = CSVToArray(response.text);
		var params = [];
		if(dataArray.length > 1){ // see if there's any data to insert
		    dataArray = dataArray.slice(1);
		    deleteTxt = "DELETE FROM " + table + " WHERE id = :id ";
		    for (var r in dataArray){
			if(dataArray[r] != ' '  && dataArray[r] != ''){
			    params.push({id:Number(dataArray[r])});
			}
		    }
		    if(params.length > 0)
			sql.executeMany(deleteTxt, params, function(){tc.setLocalDeleteTime(table); });
		}
	    }
	}).get();
	
	dateClause = '';
	if(secs=tc.checkLocalAddTime(table)){
	    dateClause = "and da >= " + secs;
	}
	
	var insQuery = encodeURI(tc.googFT + "SELECT " + tc.tableFields(table) + " FROM " + tc.tables[table].googFTNumber + " WHERE status = 'A' " + dateClause + resClause + " limit 100000");
	var insReq = Request({
	    url: insQuery
	    ,onComplete: function(response){
		var dataArray = CSVToArray(response.text);
		var insertTxt;
		var params = [];
		var s;
		if(dataArray.length > 1){ // see if there's any data to insert
		    dataArray = dataArray.slice(1);

		    insertTxt = "INSERT OR REPLACE INTO " + table + " VALUES ( " + bindNums(dataArray[0].length) + ' )';
		    for (var r in dataArray){
		    	if(dataArray[r].length == len){
			    s = {};
			    for(var j in dataArray[r]){
		    		s[j] = dataArray[r][j]
		    	    }
			    params.push(s);
			}
		    }
		    if(params.length > 0)
			sql.executeMany(insertTxt
					, params
		    			, function(){tc.setLocalTableVersion(table);tc.setLocalAddTime(table); }
		    		    , tc.onError
		    		       );
		    
		}
	    }
	}
			    ).get();
    }
    
    , loadTable: function(table){
	var query;
	var resClause = '';
	if(table == 'results'){
	    if(tc.opt_green == false)
		resClause += " and func not equal to 'greenResult' ";
	    if(tc.opt_rush == false)
		resClause += " and func not equal to 'rushBoycott' ";
	    if(tc.opt_hotel == false)
		resClause += " and func does not contain 'hotel' ";
	}
	query = encodeURI(tc.googFT + "SELECT " + tc.tableFields(table) + " FROM " + tc.tables[table].googFTNumber + " WHERE status = 'A'" + resClause + " limit 100000");
	Request({
	    url: query
	    ,onComplete: function(response){
		var queries = [];
		var dataArray = CSVToArray(response.text);
		var len = tc.tableFieldsLength(table);
		if(dataArray.length > 1 && dataArray[0].length == len){ // see if there's any data to insert and the number of fields is right
		    var dropTxt = "DROP TABLE IF EXISTS " + table;
		    var createTxt = "CREATE TABLE " + table +"( " + tc.tableFieldsTypes(table) + " )";
		    sql.execute(dropTxt);
		    sql.execute(createTxt);

		    var insertTxt;
		    var params = [];
		    var s;
		    if(dataArray.length > 1){ // see if there's any data to insert
			dataArray = dataArray.slice(1);

			insertTxt = "INSERT OR REPLACE INTO " + table + " VALUES ( " + bindNums(dataArray[0].length) + ' )';
			for (var r in dataArray){
		    	    if(dataArray[r].length == len){
				s = {};
				for(var j in dataArray[r]){
		    		    s[j] = dataArray[r][j]
		    		}
				params.push(s);
			    }
			}
			if(params.length > 0){
			    sql.executeMany(insertTxt
					    , params
					    ,function(){tc.setLocalTableVersion(table);tc.setLocalAddTime(table);tc.setLocalDeleteTime(table); }
		    			    , tc.onError);
			}
		    }
		}		
	    }
	}).get();
    }
    
    , onLookupManySuccess: function(r, status, request, callback, fields){
	if(r.data.length > 0){
	    request.data = [];
	    for(var z = 0; z<r.data.length;z++){
		var i = 0;
		var tr = {};
		for( var f in fields){
	    	    tr[fields[f]] = r.data[z][i];
	    	    i++;
		}
		request.data.push(tr);
	    }
	    callback(request);
	}
    }

    , onLookupSuccess: function(r, status, request, callback, fields){
	if(r.data.length > 0){
	    request.data = {};
	    var i = 0;
	    for( var f in fields){
	    	request.data[fields[f]] = r.data[0][i];
	    	i++;
	    }
	    callback(request);
	}
    }

    , lookupResult: function(request, callback){
	var key = request.key;
	
	var selTxt = "SELECT * FROM results WHERE key = :key or :key like key || '/%' or :key like '%.' || key || '/%' or :key like '%.' || key  LIMIT 1";

	sql.execute(selTxt 
		    , {key: key}
		    ,function(result,status){tc.onLookupSuccess(result,status,request,callback,['id','key','url','func','data']);}
		    ,tc.onError);
    }
    
    , lookupResults: function(request, callback){
	if(request.data.length > 0){
	    var keys = [];
	    for(var i in request.data){
		keys.push(request.data[i].key);
	    }
	    
	    var b = bindNums(keys.length);
	    var c = bindNums(keys.length).split(',');
	    var selTxt = "SELECT * FROM results WHERE key in ( " + b + ") or " + c.join(" like key||'/%' or ") + " like key||'/%' or "+ c.join(" like '%.'||key or ") + " like '%.'||key or " + c.join(" like '%.'||key||'/%' or ") + " like '%.'||key||'/%'";
	    request.orig_data = request.data;
	    sql.execute(selTxt
			, bindArr(keys)
			, function(result,status){tc.onLookupManySuccess(result,status,request,callback,tc.tableFields('results').split(', '));}
			,tc.onError);
	}
    }
    
    , lookupPlace: function(key,request,callback){
	var selTxt = "SELECT pd.id, pd.type FROM place p inner join place_data pd on pd.id = p.pdid WHERE siteid = :key and p.type = :type LIMIT 1";
	sql.execute(selTxt
		    ,{key: key, type:request.type}
		    , function(result,status){tc.onLookupSuccess(result,status,request,callback,['id','type']);}
		    ,tc.onError);
    }

    , lookupPlaces: function(key,request,callback){

	var data = request.data;
	var inStmt = "(" + bindNums(data.map(function(x){ return x.cid }).length) + ")";
	var i = bindArr(data.map(function(x){ return x.cid }));
	i['type'] = request.type

	var selTxt = "SELECT p.siteid, pd.id, pd.type FROM place p inner join place_data pd on pd.id = p.pdid WHERE siteid in " + inStmt +" and p.type = :type " ;
	sql.execute(selTxt
		    , i
		    , function(result,status){tc.onLookupManySuccess(result,status,request,callback,['siteid','id','type']);});
    }

    , lookupReverse: function(key,request,callback){
	// find reverse links and some other links to the same site

	var host = getReverseHost(key);

	var selTxt = "select distinct min(id) id, s, title, link, reverse_link, name, source, source_link from ( SELECT 'exact' s,r.id, reverse_link, title, r.link, s.name, s.source, s.link source_link FROM reverse r left outer join source s on s.source = r.source WHERE reverse_link = :key union SELECT 'not exact',r.id, r.reverse_link, r.title, r.link, s.name, s.source, s.link source_link FROM reverse r left outer join source s on s.source = r.source left outer join ( SELECT 'exact' s,r.id, r.reverse_link, title, r.link, s.name, s.link source_link FROM reverse r left outer join source s on s.source = r.source WHERE r.reverse_link = :key ) o on o.link = r.link WHERE ( r.reverse_link like :host2 or r.reverse_link like :host1 ) and r.reverse_link <> :key and o.link is null ) t group by s, title, link, name, source, source_link order by s, id desc limit 5;"

	var q = sql.execute(selTxt
			    ,{key:key
			      ,host1 : 'http://' + host + '/%'
			      ,host2 : 'http://%.' + host + '/%'}
			    , function(result,status){
				tc.onLookupManySuccess(result,status,request
						       ,callback
						       ,['id','s','title','link','reverse_link','name','source','source_link'])}
			    ,tc.onError);
    }

    , lookupReverseHome: function(key,request,callback){
	var selTxt = "SELECT distinct min(r.id) id, 'exact' s, reverse_link, title, r.link, s.source, s.name, s.link source_link FROM reverse r left outer join source s on s.source = r.source WHERE reverse_link in (" + bindNums(key.length) + ") group by 'exact', reverse_link, title, r.link, s.source, s.name, s.link";
	request.key = '';
	sql.execute(selTxt, bindArr(key),function(result,status){tc.onLookupManySuccess(result,status,request,callback,['id','s','reverse_link','title','link','source','name','source_link'])},tc.onError);
    }
    
    , lookupSubvert: function(key, request, callback){
	var selTxt = "select sd.id, data, url from subverts s join results sd on sd.id = s.sdid where s.txt = :key ";
	sql.execute(selTxt,{key:key},function(result,status){tc.onLookupManySuccess(result,status,request,callback,['id', 'data','url']);},tc.onError);
    }

    , sendStat: function(key){
	Request({url: 'http://thinkcontext.org/s/?' + key}).get();
    }

    // , urlResolve: function(request,callback){
    // 	var s = request.key.split('/');
    // 	if(s.length > 3){
    // 	    var domain = s[2];
    // 	    if(bitlyDomain(domain)){
    // 		// do nothing because after trying several techniques we 
    // 		// can't resolve bitly url's
    // 		// xmlhttprequest doesn't expose redirects (WTF!)
    // 		// and bitly refuses to let FF see the link info page (Origin header?)
		
    // 		// var {XMLHttpRequest} = require("xhr");
    // 		// var r = new XMLHttpRequest();
    //             // r.open('HEAD', request.key , true);
    //             // r.onreadystatechange = function (aEvt) {
    // 		//     if(r.status != 200){

    // 		//     }
    // 		// }
    // 		// r.send();
    // 	    } else if(domain == 'goo.gl'){
    // 		var r = new Request({
    // 		    url: 'https://www.googleapis.com/urlshortener/v1/url?shortUrl='+request.key
    // 		    ,onComplete: function(response){
    // 			request.url = response.json.longUrl;
    // 			callback(request);
    // 		    }});
    // 	    }
    // 	}
    // }
};

tc.connectDB();
tc.loadAllTables();
timer.setTimeout(tc.updateAllTables,10000); // do at idle?
timer.setInterval(function(){tc.updateTable('reverse')}, 3650000);
timer.setInterval(tc.updateAllTables, 10870000);

exports.lookupResult = tc.lookupResult;
exports.lookupResults = tc.lookupResults;
exports.lookupPlace = tc.lookupPlace;
exports.lookupPlaces = tc.lookupPlaces;
exports.lookupReverse = tc.lookupReverse;
exports.lookupReverseHome = tc.lookupReverseHome;
exports.lookupSubvert = tc.lookupSubvert;
exports.sendStat = tc.sendStat;
//exports.urlResolve = tc.urlResolve;
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.

function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );

    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
        ){
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );
        }

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
            );

        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];
        }

        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }
    // Return the parsed data.
    return( arrData );
}

function getReverseHost(url){
    var host;
    var ar;
    var tld;
    if(host = url.split('/')[2]){
	ar = host.split('.');
	if(ar[0] == 'www'){
	    ar.shift();
	}
	tld = ar[ar.length - 1];
	if(ar.length <= 2){
	    return ar.join('.')
	} else if((tld == 'com'
		   || tld == 'net'
		   || tld == 'gov'
		   || tld == 'edu'
		   || tld == 'org')
		  && !(tld == 'com' 
		       && (ar[ar.length - 2] == 'patch'
			   || ar[ar.length - 2] == 'cbslocal'
			   || ar[ar.length - 2] == 'curbed'
			   || ar[ar.length - 2] == 'yahoo'
			   || ar[ar.length - 2] == 'craigslist')
		      )){
	    return ar.slice(ar.length - 2).join('.')
	} else {
	    return ar.slice(ar.length - 3).join('.')
	}
    }
    return null;
}

// function bitlyDomain(domain){
//     if(domain == 'bitly.com' || domain == 'bit.ly' || domain == 'nyti.ms' || domain == 'wapo.st' || domain == 'n.pr' || domain == 'on.wsj.com' || domain == 'bbc.in'|| domain == 'gaw.kr'|| domain == 'huff.to'|| domain == 'bloom.bg'|| domain == 'nyp.st'|| domain == 'politi.co'|| domain == 'usat.ly'|| domain == 'j.mp'|| domain == 'cbsn.ws'|| domain == 'fxn.ws'|| domain == 'theatln.tc'|| domain == 'on.msnbc.com'|| domain == 'slate.me'|| domain == 'buswk.co'|| domain == 'thebea.st'|| domain == 'ti.me'|| domain == 'bo.st'|| domain == 'econ.st'|| domain == 'cnet.co'|| domain == 'chroni.cl'|| domain == 'on.cc.com'|| domain == 'yhoo.it'|| domain == 'trib.in'|| domain == 'wny.cc'|| domain == 'rol.st'|| domain == 'hrld.us')
// 	return 1
// }

// function resolveMap(url){
//     var s = url.split('/');
//     if(s.length > 3){
// 	var domain = s[2];
// 	if(bitlyDomain(domain))
// 	    return 'https://bitly.com/' + s[3];
// 	else if(domain == 'goo.gl')
// 	    return url;	
//     }
// }