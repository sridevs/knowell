const Parse = require('csv-parse');
const fs = require('fs');

module.exports = {
  validate: (filePath, callback) => {
    let data = {books: {}, error: null};
    let source = fs.createReadStream(filePath);
    let parser = Parse({
      delimiter: ',', columns: header => {
        if (JSON.stringify(header) !== JSON.stringify(['isbn', 'numOfCopy'])) {
          throw new Error("Invalid Format");
        }
        return header;
      }
    });
    parser.on("readable", () => {
      let record;
      while (record = parser.read()) {
        let isbn = record.isbn.trim();
        let numOfCopy = record.numOfCopy.trim();
        if (isNaN(isbn) || isNaN(numOfCopy)) {
          parser.emit('error', new Error("Invalid Format"));
        }
        if (data.books[isbn]) data.books[isbn] += +numOfCopy;
        else data.books[isbn] = +numOfCopy;
      }
    });
    parser.on("error", error => {
      if (fs.existsSync()) {
        fs.unlink(filePath);
      }
      data.error = error;
      callback(data.error);
    });
    parser.on("end", () => {
      if (fs.existsSync()) {
        console.log("reached")
        fs.unlink(filePath);
      }
      callback(data.books)
    });
    source.pipe(parser);
  },
  
  parseBody: (req, res, next) => {
    let result = [];
    let body = req.body;
    for (let key in body) {
      if (Array.isArray(body[key])) {
        if (body[key][1]) result.push(JSON.parse(body[key][0]));
      }
    }
    req.body = result;
    next();
  },
  
  parseUsersCSV: (filePath) => {
    return new Promise((resolve, reject) => {
      let data = {emails: {}};
      let source = fs.createReadStream(filePath);
      let parser = Parse({
        delimiter: ',', columns: header => {
          if (JSON.stringify(header) !== JSON.stringify(['email'])) throw new Error("Invalid Format");
          return header;
        }
      });
      parser.on("readable", () => {
        let record;
        while (record = parser.read()) {
          let email = record.email.trim();
          data.emails[email] = true;
        }
      });
      parser.on("error", error => {
        fs.unlink(filePath);
        data.error = error.message;
        resolve(data);
      });
      parser.on("end", () => {
        fs.unlink(filePath);
        resolve(data);
      });
      source.pipe(parser);
    });
  }
};