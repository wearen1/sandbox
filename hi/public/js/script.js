function resize(){
    if (document.getElementById('full-mode-menu').style.display == "none"){
        //document.getElementById('right-true-area').style.width = document.body.clientWidth + "px";
        document.getElementById('head-width').style.width = (document.body.clientWidth) + "px";
    }else{
        document.getElementById('head-width').style.width = (document.body.clientWidth - 310) + "px";
        //document.getElementById('right-true-area').style.width = (document.body.clientWidth - 310) + "px";
    }

    document.getElementById('right-true-area').style.width = (document.body.clientWidth) + "px";
    var optimal = ( document.body.clientHeight - 250 ) / 12;
    document.getElementById('scroll-dialogs').style.height = optimal * 8 + "px";
    document.getElementById('scroll-contacts').style.height = optimal * 4 + "px";


    document.getElementById('scroll-theme-settings').style.height = optimal * 4 + "px";
    document.getElementById('scroll-basic-settings').style.height = (document.body.clientHeight - 132 - $('#scroll-theme-settings').height()) + "px";
}


/* CHOOSE THEME */

function SetTheme(id){
    $('.active-theme').remove();
    $('#set-theme-' + id ).append('<div class="fl_r active-theme"></div>');

    // swal("Good job!", "Selected theme now is active.", "success");
    // setTimeout( function () {$('.wrap').attr('class', 'wrap theme_' + id);}, 100);

    $('.wrap').attr('class', 'wrap theme_' + id);
}


$(document).ready(function(){
    document.getElementById('show-settings').addEventListener('click', function() {
        $('.setting-page').show("slide", { direction: "right", easing: 'easeInOutQuart' }, 500);
    }, false);
});

var fullscreenWindow = null;
var head = true;
$('.top_worm').click(function(){
    if(head){
        if (fullscreenWindow !== null && $('#window-' + fullscreenWindow).length)
           $('#dialog-actions-' + fullscreenWindow).find('div:nth-child(1)')[0].click();

        $('.head').animate({marginTop: '-42px'}, 300, 'easeInOutQuart');
        $('.top_worm').animate({marginTop: '-37px'}, 300, 'easeInOutQuart', function(){
            $('#full-mode-menu').animate({marginLeft: '-100%'}, 500, 'easeInOutQuart', function(){
                head = false;
            });
        });
    }else{
        $('#full-mode-menu').animate({marginLeft: '0%'}, 500, 'easeInOutQuart', function(){
            $('.head').animate({marginTop: '0px'}, 300, 'easeInOutQuart');
            $('.top_worm').animate({marginTop: '0px'}, 300, 'easeInOutQuart', function(){
                head = true;
            });
        });
    }
});


$('.profile-info').click(function(){
    $('.user-settings').is(':visible') ? $('.user-settings').slideUp() : $('.user-settings').slideDown();
});

$(document).mouseup(function (e){
    var container = $('.user-settings');
    var right_settings = $('.setting-page');

    if (!container.is(e.target) && container.has(e.target).length === 0 && !$('.profile-info').is(e.target)){
        $('.user-settings').slideUp()
    }

    if (!right_settings.is(e.target) && right_settings.has(e.target).length === 0){
        $('.setting-page').hide("slide", { direction: "right", easing: 'easeInOutQuart' }, 500);
    }

});
