const path = require('path');
const connect = require(path.join(__dirname, '/connect'));
const {exit} = require(path.join(__dirname, '/services'));
const fs = require('fs');
const {ObjectId} = require('mongodb');
const config = require(path.join(__dirname, '/config'));

connect({ collectionName: 'data_2' })
  .then(async (res) => {
    const {collection} = res;
    const backupPath = path.join(__dirname, 'backups', 'backup-1536569284101');
    const backupData = fs.readFileSync(backupPath, 'utf8').split(config.delimiter);
    const errorLogs = path.join(__dirname, 'logs.txt');
    
    for (let a = 0; a < backupData.length; a++) {
      await new Promise((res, rej) => {
        if (!backupData[a]) {
          return res();
        }
        const field = JSON.parse(backupData[a]);
        if (!ObjectId.isValid(field._id)) {
          return rej(new Error('Invalid ObjectId'));
        }
        field._id = ObjectId(field._id);
        collection.insert(field, function(err, result) {
          if (err) {
            console.log(err);
            fs.appendFileSync(errorLogs, field._id + "\n");
            return res();
          }
          res();
        });
      });
    }
  })
  .catch(exit);