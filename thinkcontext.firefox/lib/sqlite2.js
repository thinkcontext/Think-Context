var {components} = require("chrome");

// const fileDirectoryService = Cc["@mozilla.org/file/directory_service;1"].
//                             getService(Ci.nsIProperties).
//                             get("ProfD",Ci.nsIFile);

// const storageService = Cc["@mozilla.org/storage/service;1"].
//                         getService(Ci.mozIStorageService);

components.utils.import("resource://gre/modules/Sqlite.jsm");
components.utils.import("resource://gre/modules/Task.jsm");

let db = null;
exports.connect = function connect(database){
    db  = Sqlite.openConnection({path: database});
}

exports.executeMany = function executeMany(sql,args,success){
    db.then(
	function onConnection(connection){
	    connection.executeTransaction(
		function complexTransaction(){
		    console.error('transaction');
		    console.error(args.length);
		    args = args.slice(0,50);
		    console.error(args.length);
		    for(let data of args){
			connection.executeCached(sql,data);
		    }
		    console.error('onStatementComplete',sql);
		    success();
		});
	}
	,function onError(e){
	    console.error(e.name + ' - ' + e.message);
	}
    );

}

exports.execute = function execute(sql,args,success){
    db.then(
	function onConnection(connection){
	    connection.execute(sql,args).then(
		function onStatementComplete(result) {
		    console.error('onStatementComplete',sql);
		    if(success)
			success();
		}
	    );
	}
	,function onError(e){
	    console.error(e.name + ' - ' + e.message);
	}
    );
}

exports.close = function close(){
    db = null;
}
