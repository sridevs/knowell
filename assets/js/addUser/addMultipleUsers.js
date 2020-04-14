$("document").ready(function () {
  $('#check-all-users').on('click', function () {
    var allCheckBoxes = $('input[type=checkbox]');
    if ($('#check-all-users').is(':checked')) {
      allCheckBoxes.each(function () {
        if (!$(this).is(':checked')) {
          $(this).click();
        }
      });
    }else{
      allCheckBoxes.each(function () {
        if ($(this).is(':checked')) {
          $(this).click();
        }
      });
    }
  });
});