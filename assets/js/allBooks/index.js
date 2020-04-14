$('#all-books').ready(function () {
    $('#all-books').addClass("selected");
    setListToggleFocus();
});

var showGridView = function () {
    if ($('#title-grid-view-container').hasClass('hide')) {
        $('#title-list-view-container').toggleClass('show hide');
        $('#list-toggle').removeClass('toggle-active');
        $('#title-grid-view-container').toggleClass('hide show');
        $('#grid-toggle').addClass('toggle-active')
    }
};

var showListView = function () {
    if ($('#title-list-view-container').hasClass('hide')) {
        $('#title-grid-view-container').toggleClass('show hide');
        $('#grid-toggle').removeClass('toggle-active');
        $('#title-list-view-container').toggleClass('hide show');
        $('#list-toggle').addClass('toggle-active')
    }
};

var setListToggleFocus = function () {
    $('#list-toggle').focus();
};

var goBack = function () {
    window.history.back();
};
