$('#remove-img-btn').ready(() => {
    $('#remove-img-btn').hide();
    $('#remove-img-btn').click(removeSelectedImage);
});

const updateImage = (input) => {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            if($('.upload-img')) {
                $('.upload-img').toggleClass('upload-img updated-img')
                    .attr('src', e.target.result)
            }
            $('.updated-img').attr('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
        showRemoveImageIcon();
    }
};

const showRemoveImageIcon = () => {
    $('#remove-img-btn').show();
};

const removeSelectedImage = () => {
    $('.updated-img').toggleClass('updated-img upload-img')
        .attr('src', '../../images/upload.svg');
    $('.updated-img').attr('src', '');
    $('#remove-img-btn').hide();
};

const validateForm = () => {
    let mandatoryFields = [$('#title'), $('#author')];
    mandatoryFields.forEach(function (field) {
       if(!field[0].value) {
           field.addClass('emptyFields');
       } else {
        field.removeClass('emptyFields');
       }
    });
    if(!mandatoryFields[0][0].value || !mandatoryFields[0][0].value) {
        return false;
    }
    Library.showLoader();
    return true;
};