function up() {
    $('#num-of-copies')[0].value++;
    enableNextBtn();
}

function down() {
    var copies = $('#num-of-copies')[0].value;
    if (+copies <= 1 || copies == '')
        $('#num-of-copies')[0].value = 1;
    else
        $('#num-of-copies')[0].value--;
    enableNextBtn();
}

function enableNextBtn() {
    $('#error-msg').hide();
    if ($('#num-of-copies')[0].value != "" && $('#isbn')[0].value != "") {
        $('#submit').attr('disabled', false);
    } else {
        $('#submit').attr('disabled', true);
    }
}

$("document").ready(function () {

    $('#cross-isbn').click(function () {
        $('#isbn')[0].value = "";
        enableNextBtn();
    });

    $(document).keydown(function (e) {
        if (e.keyCode == 38) up();
        if (e.keyCode == 40) down();
    });

    $('#up').click(function () {
        up();
    });

    $('#down').click(function () {
        down()
    });

    $('#num-of-copies')[0].onkeyup = function (ele) {
        var copies = +( $('#num-of-copies')[0].value);
        if (copies == 0)
            $('#num-of-copies')[0].value = '';
        enableNextBtn();
    };

    $('#isbn')[0].onkeyup = function (ele) {
        var copies = +( $('#num-of-copies')[0].value);
        if (copies == 0)
            $('#num-of-copies')[0].value = '';
        enableNextBtn();
    };

    $('#input-bulk-upload').change(function () {
        var label = $(this).val().replace(/\\/g, '/').replace(/.*\//, '');
        $('#file-name').val(label);
        $('#upload').attr('disabled', false);
    });

    $('#fancy-checkbox-info').click(function () {
        $('input:checkbox').each(function () {
            $(this).prop('checked', this.checked);
        })
    });
});
