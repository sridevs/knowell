$('#search-book').ready(function(){
    $('#search-book').addClass("selected");
    toggleCheckbox();
});

function verifySearchText() {
    var searchText = $('#search-bar')[0].value;
    if(searchText == '') return false;
    var isCheckboxChecked = $('#search-by-tag-number').is(':checked');
    if (isCheckboxChecked) {
        $('#search-title-form')[0].action = '/books/searchByBookId';
    }
}

function toggleCheckbox() {
    var isCheckboxChecked = $('#search-by-tag-number').is(':checked');
    if (isCheckboxChecked){ $('#search-bar')[0].placeholder = 'Search book by book id';}
    else $('#search-bar')[0].placeholder = 'Search book by title, author, publisher';

}