$('#email').mouseout(function () {
    enableAddButton();
});

var isAnyRoleChecked = function () {
  return $('#admin-role').is(':checked') || $('#borrower-role').is(':checked') || $('#librarian-role').is(':checked');
};

var getEmail = function () {
    return document.getElementById('email').value;
};

var enableAddButton = function () {
    autoSelectBorrowerIfLibrarianIsChecked();
    if(getEmail() && isAnyRoleChecked()){
        $('#submit').attr('disabled', false);
    } else {
        $('#submit').attr('disabled', true);
    }
};

var addSingleUser = function () {
    var selected = 1;
    var notSelected = 0;
    var requestBody = {
        email: getEmail(),
        isAdmin: $('#admin-role').is(':checked') ? selected : notSelected,
        isBorrower: $('#borrower-role').is(':checked') ? selected : notSelected,
        isLibrarian: $('#librarian-role').is(':checked') ? selected : notSelected
    };
    $.post("/users/add", requestBody,
        function (res, err) {
            if (res.roleError) {
                document.getElementById("role-error-msg").innerHTML=res.error;
            } else if (res.mailError) {
                document.getElementById("mail-error-msg").innerHTML=res.error;
            } else if(res.email){
                Library.showLoader();
                localStorage.setItem("successfullysingleUserAdded", true);
                localStorage.setItem("email", res.email);
                window.location.reload();
            } else {
                Library.removeLoader()
            }
        });
};

var autoSelectBorrowerIfLibrarianIsChecked = function () {
    if ($('#librarian-role').is(':checked'))
        document.getElementById("borrower-role").checked = true;
};
