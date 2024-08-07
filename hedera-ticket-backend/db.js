const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
 
let _db;
let _admindb;

export const connectToServe = async() => {
	try {
		const db = await client.connect();
		_db = db.db("Hedera");
        _admindb = db.db("admin");
        console.log("Successfully connected to MongoDB."); 
		
	}
	catch(err){
		console.log(err);
	}
}

export const getDb = () => {
	return _db;
}

export const getAdminDb = () => {
	return _admindb
}
 
// module.exports = {
//   connectToServer: function (callback) {
//     client.connect(function (err, db) {
     
//       if (db)
//       {
//         _db = db.db("Hedera");
//         _admindb = db.db("admin");
//         console.log("Successfully connected to MongoDB."); 
//       }
//       return callback(err);
//          });
//   },
 
//   getDb: function () {
//     return _db;
  
//   },
//   getAdminDb : function(){
//     return _admindb;
//   }
// };