const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');
const readFilePromise = Promise.promisify(fs.readFile);

// var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, id) => {
    fs.writeFile((exports.dataDir + `/${id}.txt`), text, (err) => {
      if (err) {
        throw ('error');
      } else {
        callback(null, { text, id });
      }
    });
  });
};

exports.readAll = (callback) => {
  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      callback(err);
    } else {
      var data = _.map(files, (file) => {
        var id = path.basename(file, '.txt');
        var filepath = path.join(exports.dataDir, file);
        return readFilePromise(filepath).then((fileData) => {
          return { id: id, text: fileData.toString() };
        });
      }
      );
      Promise.all(data)
        .then((allData) => {
          // console.log('dataaaaa', allData);
          callback(null, allData);
        });
    }
  });
};

exports.readOne = (id, callback) => {
  fs.readFile((exports.dataDir + `/${id}.txt`), (err, data) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text: data.toString('utf8') });
    }
  });
};

exports.update = (id, text, callback) => {
  fs.access((exports.dataDir + `/${id}.txt`), (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile((exports.dataDir + `/${id}.txt`), text, (err) => {
        if (err) {
          callback(new Error(`No item with id: ${id}`));
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.access((exports.dataDir + `/${id}.txt`), (err) => {
    if (err) {
      callback(new Error(`No Item with id: ${id}`));
    } else {
      fs.unlink((exports.dataDir + `/${id}.txt`), (err) => {
        if (err) {
          callback(new Error(`No Item with id: ${id}`));
        } else {
          callback(null, { id });
        }
      });
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
