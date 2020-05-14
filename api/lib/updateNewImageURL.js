let fs = require('fs');
let interactor = require('../../api/services/interactor');
let bookApi = require('../../api/services/bookApi');

var fetchWithNewUrl = async titles => {
  var result = await titles.map(async (e, i) => {
    var result = await interactor.fetchInfoFor(e.isbn);
    if(!result.error && result.data.thumbnailURL) {
      var url  = result.data.thumbnailURL;
      var title  = result.data.title;
      var cdnObj = await bookApi.addImageToCdn(url, title);
      e.thumbnailURL = cdnObj.url;
    }
    return e;
  });
  fs.writeFileSync('titles.json', JSON.stringify(result), 'utf8');
};
const titles = JSON.parse(fs.readFileSync('titles.json', 'utf8'));

fetchWithNewUrl(titles);



