const { reject, defer } = require('sdk/core/promise');
const config = require('config');
const L = require('logger');


let Pouch = require('./pouchdb/dist/pouchdb-nightly');

// DEBUG MODE
Pouch.DEBUG = true;

function handleError(error) {
  if (error.json) throw error.json;
  else throw { code: error.status, error: error.statusText, message: error.text };
}

function PouchDbClient(options) {
  options = options || {};

  this.db = options.db || null;
  this.dbLocal = options.dbLocal ? options.dbLocal + options.collection : config.DB_LOCAL + options.collection;
  this.dbRemote = options.dbRemote ? options.dbRemote + options.collection : config.DB_REMOTE + options.collection;

  this.DB_KEY = 0;

  console.log('Using: ' + this.dbRemote);
  return this;
}

/**
 * Initialize a new PouchDB client
 * @returns {Function}
 */
PouchDbClient.prototype.init = function () {
  let _that = this;
  let deferred = defer();

  if (!this.db) {
    Pouch(this.dbLocal, function (err, pouchdb) {
      if (err) {
        L.log("Can't open pouchdb database");
      } else {
        _that.db = pouchdb;
      }

      deferred.resolve();
    });
  }

  return deferred.promise;
};


/**
 * Read collection
 * @param args
 */
PouchDbClient.prototype.readCollection = function (args) {
  let _that = this;
  let deferred = defer();

  var onComplete;

  onComplete = function(err, resp) {
    if (!err) {
      // fetch local database info to get the latest local sequence number
      _that.db.info(function (err, info) {
        _that.db.changes({
          since: _that.DB_KEY,
          continuous: false,
          complete: function (err, response) {
            let len = response.results.length;
            var items = [];

            L.log('Results', len, 'since KEY #', _that.DB_KEY);
            if (len > 0) {
              _that.DB_KEY = response.results[len - 1].seq;
              var k = 0;
              response.results.forEach(function (change) {
                _that.db.get(change.id, function (err, doc) {
                  k++;
                  items.push(doc);
                  if (len === k) {
                    //L.log(items);
                    deferred.resolve({ version: -1, items: items });
                  }
                });
              });
            } else {
              // TODO: what exactly is version?
              deferred.resolve({ version: -1, items: [] });
            }
          }
        });
      });

    } else {
      deferred.reject("error in readCollection", err);
    }
  };

  // replicate remote to local
  Pouch.replicate(this.dbRemote, this.db, {
    complete: onComplete
  });


  return deferred.promise;
};


/**
 * Update collection
 * @param args
 */
PouchDbClient.prototype.updateCollection = function (args) {
  let _that = this;
  let deferred = defer();
  let items = (args && args.items) ? { docs: args.items } : { docs: [] };

  _that.db.bulkDocs(items, function (err, response) {
    if (!err) {
      Pouch.replicate(_that.db, _that.dbRemote, function (err, resp) {
        if (!err) {
          L.log("Replication failed!", err);
          deferred.reject(err);
        } else {
          L.log('REPLICATE COMPLETE: local -->>> remote', 'just put', items.docs.length, 'documents');
          // TODO: version needs to be specified
          deferred.resolve({version: -1, items: [] });
        }
      });
    } else {
      L.log('error in updateCollection', 'this.db.bulkDocs');
    }
  });

  return deferred.promise;
};


/**
 * Reset the local PouchDb
 */
PouchDbClient.prototype.reset = function () {
  let _that = this;

  Pouch.destroy(this.dbLocal, function (err1) {
    if (err1) {
      L.log("Database destruction error")
    } else {
      Pouch(_that.dbLocal, function (err2, pouchdb) {
        if (err2) {
          L.log("Database creation error")
        } else {
          _that.db = pouchdb;
        }
      })
    }
  });
};


/**
 * Get database collection information
 * @param args
 */
PouchDbClient.prototype.getCollectionsInfo = function (args) {
  throw "must implement getCollectionsInfo";
};


module.exports = PouchDbClient;
