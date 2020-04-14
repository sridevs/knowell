$(document).ready(function() {
    $(".checkbox").change(function () {
        var librarianCheckbox = $(`#${this.dataset.email.split('@')[0]}isLibrarian`)[0];
        if (this.dataset.field == 'isBorrower' && !this.checked && librarianCheckbox.checked) {
            this.checked = true;
            this.disabled = true;
            Library.wrongUserInput();
            return;
        }
        toggleBorrowerIfLibrarian(this);
        updateUserStatus(this);
    });
    $('#example').DataTable();
    
} );


var updateUserStatus = function (element) {
    var fieldsToSend = [element.dataset.field];
    var valuesToSend = [element.checked ? 1 : 0];
    if (element.dataset.field == 'isLibrarian' && element.checked) {
        fieldsToSend.push('isBorrower');
        valuesToSend.push(1)
    }
    $.post("/users/updateUser",
        {
            email: element.dataset.email,
            fields: fieldsToSend,
            values: valuesToSend
        });
};

var toggleBorrowerIfLibrarian = function (element) {
    if (element.dataset.field == 'isLibrarian' && !element.checked) {
        var name = element.dataset.email.split('@')[0];
        $(`#${name}isBorrower`)[0].disabled = false;
    }

    if (element.dataset.field == 'isLibrarian' && element.checked) {
        var name = element.dataset.email.split('@')[0];
        $(`#${name}isBorrower`)[0].checked = true;
        $(`#${name}isBorrower`)[0].disabled = true;
    }
};