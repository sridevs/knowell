$('body').ready(function () {
    var tabs = document.querySelectorAll(".tablinks");
    tabs.forEach(function (each) {
        each.onclick = function () {
            Library.showTabContent(event, each.dataset.id);
        };
    });
    $('#defaultOpen')[0].click()
    $("#add-user-selection-bar")[0].className += "selected";

    $('#input-bulk-upload').change(function () {
        var label = $(this).val().replace(/\\/g, '/').replace(/.*\//, '');
        $('#file-name').val(label);
        if(label) $('#upload').attr('disabled', false);
        else $('#upload').attr('disabled', true);
    });
});