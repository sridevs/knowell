var Library = {};
Library.showTabContent = function (evt, view) {
    var tabcontent = document.getElementsByClassName("tabcontent");
    for (var i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    var tablinks = document.getElementsByClassName("tablinks");
    for (var i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(view).style.display = "block";
    evt.currentTarget.className += " active";
};


var removeFromLocalStorage = function (keys) {
    keys.forEach(function (key) {
        localStorage.removeItem(key);
    })
};

Library.notifyGlobally = function (message) {
    var snackbar = $("#snackbar-global")[0]
    snackbar.innerHTML = message;
    snackbar.className += " show";
    setTimeout(function () {
        snackbar.className = snackbar.className.replace("show", "");
    }, 3500);
};

Library.showLoader = function () {
    $('.ajax_loader').removeClass('hidden');
    $('body').addClass('disable-body');
};

Library.removeLoader = function () {
    $('.ajax_loader').addClass('hidden');
    $('body').removeClass('disable-body');
};

var createCSVRawData = function (reportsData) {
    var header = [];
    for (let each in reportsData[0]) {
        header.push(each)
    }
    var rows = [];
    reportsData.forEach(each => {
        var row = [];
        header.forEach(key => {
            row.push(each[key])
        });
        rows.push(row.join(','));
    });
    
    return header.join(',') + '\n' + rows.join('\n');
};

Library.downloadCSV = function (reportsData, filename) {
    var csv = createCSVRawData(reportsData);
    var dateNow = new Date();
    var dateTime = `${dateNow.toLocaleDateString(('en-GB'))}_${dateNow.toLocaleTimeString()}`.replace(' ', '-');
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename + dateTime + '.csv';
    hiddenElement.click();
};


Library.borrowTitle = function (titleId, titleName, tagNumber) {
        Library.showLoader();
        $.post("/books/borrow",
            {
                titleID: titleId,
                tagNumber: tagNumber
            },
            function (tagNumber, err) {
                if (tagNumber) {
                    localStorage.setItem("successfullyBorrowed", true)
                    localStorage.setItem("tagNumber", tagNumber);
                    localStorage.setItem("titleName", titleName);
                    window.location.reload();
                } else {
                    Library.removeLoader()
                }
            }).fail(Library.removeLoader());
};

Library.enableBook = function (tagNumber) {
        Library.showLoader();
        $.post("/books/disable",
            {
                tagNumber: tagNumber,
                disabled: 0
            },
            function (resp, err) {
                if (resp) {
                    window.location.reload();
                } else {
                    Library.removeLoader()
                }
            });
};

Library.disableBook = function (tagNumber) {
        Library.showLoader();
        $.post("/books/disable",
            {
                tagNumber: tagNumber,
                disabled: 1
            },
            function (resp, err) {
                if (resp) {
                    window.location.reload();
                } else {
                    Library.removeLoader()
                }
            });
};


Library.returnTitle = function (titleId, titleName) {
        titleName = unescape(titleName);
        $('#return-confirmation').modal('hide');
        Library.showLoader();
        $.post("/books/return",
            {titleID: titleId},
            function (tagNumber, err) {
                if (tagNumber) {
                    localStorage.setItem("successfullyReturned", true)
                    localStorage.setItem("tagNumber", tagNumber);
                    localStorage.setItem("titleName", titleName);
                    window.location.reload();
                } else {
                    Library.removeLoader()
                }
            });
};

var notifyAddedUser = function (email) {
    Library.notifyGlobally("<strong>" + email + "</strong> has been added successfully to the library.");
};

var notifyBorrowedTitle = function (tagNumber, titleName) {
    Library.notifyGlobally("<strong>" + titleName + "</strong> with Book Id: <strong>" + tagNumber + "</strong> is" +
        " successfully borrowed.");
};

var notifyReturnTitle = function (tagNumber, titleName) {
    Library.notifyGlobally("<strong>" + titleName + "</strong> with Book Id: <strong>" + tagNumber + "</strong> is" +
        " successfully returned.");
};

Library.notifyError = function () {
    Library.notifyGlobally("<strong>Something went wrong!</strong>");
};


Library.wrongUserInput = function () {
    Library.notifyGlobally("<strong>It's not a good idea!!</strong>");
};

$('body').ready(function () {
    if (localStorage.getItem('successfullyBorrowed')) {
        notifyBorrowedTitle(localStorage.getItem('tagNumber'), localStorage.getItem('titleName'))
    } else if (localStorage.getItem('successfullyReturned')) {
        notifyReturnTitle(localStorage.getItem('tagNumber'), localStorage.getItem('titleName'))
    } else if (localStorage.getItem('successfullysingleUserAdded')) {
        notifyAddedUser(localStorage.getItem('email'))
    }
    setTimeout(removeFromLocalStorage(['tagNumber', 'titleName', 'successfullyBorrowed', 'successfullyReturned', 'successfullysingleUserAdded', 'email']), 1000);
});


Library.returnConfirmation = function (titleId, titleName) {
    titleName = escape(titleName);
    var body = $('.container');
    body.append(`
    <div class="modal" id="return-confirmation" role="dialog" tabindex="1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Are you sure you want to return this book?</h4>
                </div>
                <div class="modal-body row">
                    <div class="col-md-3 col-md-offset-3">
                        <button class="btn button-grey" data-dismiss="modal">No</button>
                    </div>
                    <div class="col-md-3">
                        <button class="btn button-grey" 
                        onclick='Library.returnTitle( ${titleId}, "${titleName}")'>Yes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`);
    $('#return-confirmation').modal('show');
};

$(document).on('hide.bs.modal','#return-confirmation', function () {
    $('#return-confirmation').remove();
});