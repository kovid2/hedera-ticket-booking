const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);
 
let _db;
let _admindb;

module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
     
      if (db)
      {
        _db = db.db("Hedera");
        _admindb = db.db("admin");
        console.log("Successfully connected to MongoDB."); 
      }
      return callback(err);
         });
  },
 
  getDb: function () {
    return _db;
  
  },
  getAdminDb : function(){
    return _admindb;
  }
};