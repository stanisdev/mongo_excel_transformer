const path = require('path');
const connect = require(path.join(__dirname, '/connect'));
const fs = require('fs');

connect({ collectionName: 'data' })
  .then((res) => {
    const {collection} = res;
    const backupName = 'backup-' + Date.now();
    const backupPath = path.join(__dirname, 'backups', backupName);

    collection
      .count({})
      .then(async (total) => {

        for (let skip = 0; skip < total; skip++) {
          await new Promise((res, rej) => {
            collection
              .find({})
              .limit(1)
              .skip(skip)
              .toArray((err, docs) => {
                if (err) {
                  return rej(new Error('Doc not retrieved'));
                }
                const doc = docs[0];
                if (!doc) {
                  return rej(new Error('Empty doc'));
                }
                fs.appendFileSync(backupPath, JSON.stringify(doc) + "\n");
                res();
              });
          });
        }
      })
      .catch(exit);
  })
  .catch(exit);

function exit(err) {
  console.log(err);
  process.exit(1);
}
