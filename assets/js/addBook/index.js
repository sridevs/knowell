window.onload = function () {
    var tabs = document.querySelectorAll(".tablinks");
    tabs.forEach(function (each) {
        each.onclick = function () {
            Library.showTabContent(event, each.dataset.id);
        };
    });
    $('#defaultOpen')[0].click()
    $("#add-book-btn")[0].className += "selected";

    $('.has-clear input[type="text"]').on('input propertychange', function() {
        var $this = $(this);
        var visible = Boolean($this.val());
        $this.siblings('.form-control-clear').toggleClass('hidden', !visible);
    }).trigger('propertychange');

    $('.form-control-clear').click(function() {
        $(this).siblings('input[type="text"]').val('')
            .trigger('propertychange').focus();
    });

};