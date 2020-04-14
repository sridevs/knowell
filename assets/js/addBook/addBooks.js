$(document).ready(function () {
  $('#add-all').on('click', function () {
    var allCheckBoxes = $('input[type=checkbox]');
    if ($('#add-all').is(':checked')) {
      allCheckBoxes.each(function () {
        if (!$(this).is(':checked')) {
          $(this).click();
        }
      });
    } else {
      allCheckBoxes.each(function () {
        if ($(this).is(':checked')) {
          $(this).click();
        }
      });
    }
  });
  $('#add-all').click();

  $('#download-not-found-books').on('click', function () {
    var data = $('input[name=fileData]').val();
    Library.downloadCSV(JSON.parse(data), 'notFoundBooks');
  })
});