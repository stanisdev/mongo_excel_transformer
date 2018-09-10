const path = require('path');
const config = require(path.join(__dirname, '/config'));
const tunnel = require('tunnel-ssh');

module.exports = (options) => {
  return new Promise((res, rej) => {
    tunnel(config.ssh, function (error, server) {
      if (error) {
        console.log('SSH connection error: ' + error);
        return rej();
      }
  
      const MongoClient = require('mongodb').MongoClient;
      const url = `mongodb://${config.mongo.username}:${config.mongo.password}@${config.mongo.host}:27017/${config.mongo.db}`;
      MongoClient.connect(url, function (err, client) {
        if (err) {
          console.log(err);
          return rej();
        }
        console.log('Connected successfully to DB');

        const db = client.db(config.mongo.db);
        const collectionName = (options instanceof Object && options.collectionName) || config.mongo.defaultCollection;
        res({
          collection: db.collection(collectionName),
          db,
        });
      });
    });
  });
};