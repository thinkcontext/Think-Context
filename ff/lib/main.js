var ydn = require('./ydn.db-isw-core-qry.js');

var db = new ydn.db.Storage('tc');
console.log(db.getName());
var clog = function(r) { console.log(r.value); }

db.put({name: "store1", keyPath: "id"}, {id: "id1", value: "value1"});
db.put({name: "store1", keyPath: "id"}, {id: "id2", value: "value2"});

db.get("store1", "id1").done(clog);
