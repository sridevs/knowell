$('body').ready(function () {
    var tabs = document.querySelectorAll(".tablinks");
    tabs.forEach(function (each) {
        each.onclick = function () {
            Library.showTabContent(event, each.dataset.id);
        };
    });
    $('#defaultOpen')[0].click()
});

$('#lend-receive').ready(function () {
    $('#lend-receive').addClass("selected");
});

var lendReceiveBook = function (action) {
    $(`#${action}error-msg`)[0].innerText = '';
    const requestBody = {email: $(`#${action}email`)[0].value, tagNumber: $(`#${action}tag-number`)[0].value};
    if (requestBody.email && requestBody.tagNumber) {
        Library.showLoader();
        $.post('/books/' + action, requestBody,
            function (data) {
                Library.removeLoader();
                Library.notifyGlobally(data.successMsg);
            }).fail(function(response){
                Library.removeLoader();
                $(`#${action}error-msg`)[0].innerText = response.responseText;
            });

    }  else $(`#${action}error-msg`)[0].innerText = 'Please fill all fields properly.';
};