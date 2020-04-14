$('body').ready(function () {
    var tabs = document.querySelectorAll(".tablinks");
    tabs.forEach(function (each) {
        each.onclick = function () {
            Library.showTabContent(event, each.dataset.id);
        };
    });
    $('#defaultOpen')[0].click()
    $("#reports")[0].className += "selected";
});

$('#reports').ready(function(){
   $('#reports').addClass("selected");
});