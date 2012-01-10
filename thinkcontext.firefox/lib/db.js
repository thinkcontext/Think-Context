var sql = require("sqlite");
var Request = require('request').Request;
var ss = require("simple-storage");
var timer = require("timer");

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
	    , googFTNumber: '1040216'
	    , version: '0.08'
	}
	, reverse: {
	    fields: {
		id: 'integer primary key'
		, source: 'text'
		, reverse_link: 'text'
		, title: 'text'
		, link: 'text'
	    }
	    , googFTNumber: '1049740'
	    , version: '0.05'
	}
	, stocks: {
	    fields: {
		id: 'integer primary key'
		, symbol: 'text'
		, exchange: 'text'
		, data: 'text'
	    }
	    , googFTNumber: '892855'
	    , version: '0.01'
	}
	, results: { 
	    fields: {
		id:'integer primary key'
		, key: 'text'
		, url: 'text'
		, func: 'text'
		, data: 'text'
	    }
	    , googFTNumber: '2186764'
//	    , googFTNumber: '2038546'
	    , version: '0.03'
	}
	, subverts: { 
	    fields: {
		id: 'integer'
		, sdid: 'integer'
		, txt: 'text'
		, location: 'text'
		, bin_op: 'text'
		
	    }
	    , googFTNumber: '2038549' 
	    , version: '0.02'
	}
	, place: {
	    fields: {
		id: 'integer'
		, pdid: 'integer'
		, type: 'text'
		, siteid: 'text'
	    }
	    , googFTNumber: '2186393'
	    , version: '0.04'
	}
	, place_data: {
	    fields: {
		id: 'integer primary key'
		, data: 'text'
		, type: 'text'
	    }
	    , googFTNumber: '2186651'
	    , version: '0.04'
	}
    }

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

    , googFT : 'https://www.google.com/fusiontables/api/query?sql='

    , checkLocalTableVersion: function(t){
	return ss.storage[t + 'version'] == tc.tables[t].version;
    }
    , setLocalTableVersion: function(t){
	ss.storage[t + 'version'] = tc.tables[t].version;
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
	//console.log("db error: " + e.message);
	// console.log("fail");
    }
    
    , loadAllTables: function(){
	for(var t in tc.tables){
	    if(!tc.checkLocalTableVersion(t)){
		tc.loadTable(t);
	    } else {
		tc.checkNoTable(t);
	    }
	}
    }
    , checkNoTable: function(table){
	sql.execute("select count(*) from " + table
		    , tc.onSuccess
		    , function(e,stmt){ tc.loadTable(table)});
    }
    , updateAllTables: function(){
	for(var t in tc.tables){
	    tc.updateTable(t);
	}
    }
    
    , updateTable: function(table){
	var len = tc.tableFieldsLength(table);
	var dateClause = '';
	var secs;
	if(secs=tc.checkLocalDeleteTime(table)){
	    dateClause = "and dm >= " + secs;
	}

	var query  = encodeURI(tc.googFT + "SELECT id FROM " + tc.tables[table].googFTNumber + " WHERE status not equal to 'A' " + dateClause);
	//console.log(query);
	Request({
	    url: query
	    ,onComplete: function(response){

		var dataArray = CSVToArray(response);
		var queries = [];
		if(dataArray.length > 1){ // see if there's any data to insert
		    dataArray = dataArray.slice(1);
		    for (var r in dataArray){
			if(dataArray[r].length == len){
			    deleteTxt = "DELETE FROM " + table + " WHERE id = '"+dataArray[r] +"'";
			    queries.push(deleteTxt);
			}
		    }
		    //console.log(table);
		    sql.executeMany(queries, function(){tc.setLocalDeleteTime(table) }, tc.onError);
		}
	    }
	}).get();
	
	dateClause = '';
	if(secs=tc.checkLocalAddTime(table)){
	    dateClause = "and da >= " + secs;
	}

	query = encodeURI(tc.googFT + "SELECT " + tc.tableFields(table) + " FROM " + tc.tables[table].googFTNumber + " WHERE status = 'A' " + dateClause);
	//console.log(query);
	Request({
	    url: query
	    ,onComplete: function(response){
		var dataArray = CSVToArray(response.text);
		var insertTxt;
		var queries = [];
		if(dataArray.length > 1){ // see if there's any data to insert
		    dataArray = dataArray.slice(1);
		    for (var r in dataArray){
			if(dataArray[r].length == len){
			    insertTxt = "INSERT OR REPLACE INTO " + table + "( " + tc.tableFields(table) + ") VALUES ( '" + dataArray[r].map(function(x){ return x.replace(/'/g,"''");}).join("', '") + "') " ;
			    queries.push(insertTxt);
			}
		    }
		    //console.log(table);
		    sql.executeMany(queries
				    , function(){tc.setLocalTableVersion(table);tc.setLocalAddTime(table) }
				    , tc.onError
				   );
		}
	    }
	}).get();
    }

    , loadTable: function(table){
	var query;
	query = encodeURI(tc.googFT + "SELECT " + tc.tableFields(table) + " FROM " + tc.tables[table].googFTNumber + " WHERE status = 'A'");
	Request({
	    url: query
	    ,onComplete: function(response){
		var queries = [];
		var dataArray = CSVToArray(response.text);
		//		    console.log(dataArray);
		var len = tc.tableFieldsLength(table);
		if(dataArray.length > 1 && dataArray[0].length == len){ // see if there's any data to insert and the number of fields is right
		    var dropTxt = "DROP TABLE IF EXISTS " + table;
		    var createTxt = "CREATE TABLE " + table +"( " + tc.tableFieldsTypes(table) + " )";
		    var insertTxt = '';
		    //console.log(dropTxt);
		    //console.log(createTxt);
		    sql.execute(dropTxt);
		    sql.execute(createTxt);
		    dataArray = dataArray.slice(1);
		    for (var r in dataArray){
			if(dataArray[r].length == len){
			    insertTxt = "INSERT OR REPLACE INTO " + table + "( " + tc.tableFields(table) + ") VALUES ( '" + dataArray[r].map(function(x){ return x.replace(/'/g,"''");}).join("', '") + "') " ;
			    //console.log(insertTxt);
			    queries.push(insertTxt);
			    //sql.execute(insertTxt);
			}
		    }
		    console.log(table);
		    sql.executeMany(queries, function(){tc.setLocalTableVersion(table);tc.setLocalAddTime(table);tc.setLocalDeleteTime(table) }, tc.onError);
		}
	    }
	}).get();
    }
    
    , onLookupManySuccess: function(r, status, request, callback, fields){
	//console.log("in onlookupManySuccess " + r.data.length);
	if(r.data.length > 0){
	    request.data = [];
	    for(var z = 0; z<r.data.length;z++){
		var i = 0;
		var tr = {}
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
//	console.log("in onlookupSuccess " + r.data.length);
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

	var selTxt = "SELECT * FROM results WHERE key = '" + key + "' or '" + key + "' like key || '/%' or '" + key + "' like '%.' || key || '/%' or '" + key + "' like '%.' || key  LIMIT 1";
	sql.execute(selTxt, function(result,status){tc.onLookupSuccess(result,status,request,callback,tc.tableFields('results').split(', '));},tc.onError);
    }

    , lookupResults: function(request, callback){
	if(request.data.length > 0){
	    var keys = [];
	    for(var i in request.data){
		keys.push(request.data[i].key);
	    }
	
	    //	var selTxt = "SELECT * FROM results WHERE key = '" + key + "' or '" + key + "' like key || '/%' or '" + key + "' like '%.' || key || '/%' or '" + key + "' like '%.' || key ";
	    var selTxt = "SELECT * FROM results WHERE key in ( '" + keys.join("','") + "') or '" + keys.join("' like key||'/%' or '") + "' like key||'/%' or '"+ keys.join("' like '%.'||key or '") + "' like '%.'||key or '" + keys.join("' like '%.'||key||'/%' or '") + "' like '%.'||key||'/%'";
	    request.orig_data = request.data;
	    sql.execute(selTxt
			, function(result,status){tc.onLookupManySuccess(result,status,request,callback,tc.tableFields('results').split(', '));}
			,tc.onError);
	}
    }

    , lookupStock: function(key,request,callback){
	var keysplit = key.split(':');
	var selTxt;
	if(keysplit.length > 1){
	    keysplit[1] = keysplit[1].toUpperCase();
	    var selTxt = "SELECT * FROM stocks WHERE exchange = '"+ keysplit[0] + "'and symbol = '" + keysplit[1] + "'";
	} else {
	    keysplit[0] = keysplit[0].toUpperCase();
	    var selTxt = "SELECT * FROM stocks WHERE symbol = '" + keysplit[0] + "'";
	}
	sql.execute(selTxt, function(result,status){tc.onLookupSuccess(result,status,request,callback,tc.tableFields('stocks').split(', '));},tc.onError);
    }

    , lookupPlace: function(key,request,callback){
	var selTxt = "SELECT pd.id, pd.type FROM place p inner join place_data pd on pd.id = p.pdid WHERE siteid = '"+key+"' and p.type = '"+request.type+"' LIMIT 1";
	sql.execute(selTxt, function(result,status){tc.onLookupSuccess(result,status,request,callback,['id','type']);},tc.onError);
    }


    , lookupPlaces: function(key,request,callback){

	var data = request.data;
	var i;
	var inStmt = "('" + request.data.map(function(x){ return x.cid }).join("' , '") + "')";

	var selTxt = "SELECT p.siteid, pd.id, pd.type FROM place p inner join place_data pd on pd.id = p.pdid WHERE siteid in " + inStmt +" and p.type = '" + request.type + "'";
	sql.execute(selTxt, function(result,status){tc.onLookupManySuccess(result,status,request,callback,['siteid','id','type']);});
    }

    , lookupReverse: function(key,request,callback){
	// find reverse links and some other links to the same site

	var host = getReverseHost(key);

	var selTxt = "select distinct min(id) id, s, title, link, reverse_link, name, source, source_link from ( SELECT 'exact' s,r.id, reverse_link, title, r.link, s.name, s.source, s.link source_link FROM reverse r left outer join source s on s.source = r.source WHERE reverse_link = '"+key+"' union SELECT 'not exact',r.id, r.reverse_link, r.title, r.link, s.name, s.source, s.link source_link FROM reverse r left outer join source s on s.source = r.source left outer join ( SELECT 'exact' s,r.id, r.reverse_link, title, r.link, s.name, s.link source_link FROM reverse r left outer join source s on s.source = r.source WHERE r.reverse_link = '"+key+"' ) o on o.link = r.link WHERE ( r.reverse_link like 'http://%.'||'"+host+"'||'/%' or r.reverse_link like 'http://'||'"+host+"'||'/%' ) and r.reverse_link <> '"+key+"' and o.link is null ) t group by s, title, link, name, source, source_link order by s, id desc limit 5;"

	sql.execute(selTxt, function(result,status){tc.onLookupManySuccess(result,status,request,callback,['id','s','title','link','reverse_link','name','source','source_link'])},tc.onError);
    }

    , lookupReverseHome: function(key,request,callback){
	key = arrayQuoteEscape(key);
	var selTxt = "SELECT distinct min(r.id) id, 'exact' s, reverse_link, title, r.link, s.source, s.name, s.link source_link FROM reverse r left outer join source s on s.source = r.source WHERE reverse_link in ('" + key.join("','") + "') group by 'exact', reverse_link, title, r.link, s.source, s.name, s.link";
	
	request.key = '';
	sql.execute(selTxt, function(result,status){tc.onLookupManySuccess(result,status,request,callback,['id','s','reverse_link','title','link','source','name','source_link'])},tc.onError);
    }
    
    , lookupSubvert: function(key, request, callback){
	var selTxt = "select sd.id, data, url from subverts s join results sd on sd.id = s.sdid where s.txt = '" + key + "'";
	sql.execute(selTxt,function(result,status){tc.onLookupManySuccess(result,status,request,callback,['id', 'data','url']);},tc.onError);
	
    }

    , sendStat: function(key){
	//console.log("sendStat " + key);
	Request({url: 'http://thinkcontext.org/s/?' + key}).get();
    }
};

tc.connectDB();
tc.loadAllTables();
//tc.updateTable("reverse");
timer.setTimeout(tc.updateAllTables,10000); // do at idle?
timer.setInterval(tc.updateAllTables,1800000); // do at idle?

exports.lookupResult = tc.lookupResult;
exports.lookupResults = tc.lookupResults;
exports.lookupStock = tc.lookupStock;
exports.lookupPlace = tc.lookupPlace;
exports.lookupPlaces = tc.lookupPlaces;
exports.lookupReverse = tc.lookupReverse;
exports.lookupReverseHome = tc.lookupReverseHome;
exports.lookupSubvert = tc.lookupSubvert;
exports.sendStat = tc.sendStat;

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
    if(host = url.split('/')[2]){
	ar = host.split('.');
	if(ar[0] == 'www'){
	    ar.shift();
	}
	if(ar.length <= 2){
	    return ar.join('.')
	} else {
	    return ar.slice(ar.length - 3).join('.')
	}
    }
    return null;
}

function arrayQuoteEscape(arr){
    return arr.map(function(x){ return x.replace("'","''")})
}