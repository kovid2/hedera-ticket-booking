const { MongoClient } = require("mongodb");


 
var _db;
 
module.exports = {
  connectToServer: async function  () {
    console.log("Connecting to MongoDB");
    const client = new MongoClient(process.env.MONGO_URI);
    _db = client.db('hedera');
    console.log(_db);
    _admindb = client.db('admin');

  },
 
  getDb: function () {
    return _db;
  
  },
  getAdminDb : function(){
    return _admindb;
  }
};