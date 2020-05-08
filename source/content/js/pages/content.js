/*------------------------
INICIAMOS WOW
-------------------------*/
new WOW().init();

$(function () {

    $(".nav-tema-item__titulo, .nav-tema-item__btn").hover(function () {
        $(this).closest('.row').addClass('tema-activo');
    }, function () {
        $(this).closest('.row').removeClass('tema-activo');
    });

})
