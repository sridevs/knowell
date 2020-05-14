const baseUrl = "https://www.googleapis.com/books/v1/volumes?q=isbn:";
const cloudinary = require('cloudinary');
let https = require('https');
let node_isbn = require('node-isbn');

cloudinary.config({
  cloud_name: 'drgtxp7jf',
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const parseBookDetails = (bookDetails) => {
    let result = {};
    try {
        if (!bookDetails.imageLinks) bookDetails.imageLinks = {thumbnail: ''};
        result.title = bookDetails.title || '';
        result.author = (bookDetails.authors.length) ? bookDetails.authors.join(',') : '';
        result.publisher = bookDetails.publisher || '';
        result.thumbnailURL = bookDetails.imageLinks.thumbnail;
        result.pages = bookDetails.pageCount || '';
        result.description = bookDetails.description || '';
        return result;
    } catch (e) {
        result = e;
    }
    return result;
};

const addImageToCdn = (thumbnailFromApi, title) => {
  if(process.env.NODE_ENV !== 'prod')
    return {secure_url: 'some_url'}
  return cloudinary.uploader.upload(thumbnailFromApi, (result) => {
    return result
  }, {public_id: title.replace(/ /g, "_").replace(/[^a-zA-Z ]/g, "")});
};

const getFromGoogle = async isbn => {
  return new Promise((resolve, reject) => {
    let response = '';
    https.get(baseUrl + isbn + '&key=' + process.env.GOOGLE_API_KEY , res => {
      res.on('data', (chunk) => response += chunk);
      res.on('end', () => {
        let books = JSON.parse(response);
        if (books.totalItems){
          let result = parseBookDetails(books.items[0].volumeInfo);
          if(result.constructor === Error) reject(result);
          else resolve(result);
        }
        else reject(new Error('book not found'));
      });
    }).on('error', (e) => reject(e));
  });
};

const fetchFromNodeIsbn = async isbn => {
  return new Promise((resolve, reject ) => {
    node_isbn.resolve(isbn, (err, bookDetails) => {
      if (err) reject(err);
      else {
        let result = parseBookDetails(bookDetails);
        if (result.error) reject(result.error);
        else resolve(result);
      }
    });
  });
};

module.exports = {
  addImageToCdn: addImageToCdn,
  getFromGoogle: getFromGoogle,
  parseBookDetails: parseBookDetails,
  fetchFromNodeIsbn: fetchFromNodeIsbn
};
