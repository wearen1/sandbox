$(document).ready(function(){
    document.getElementById('change-state').addEventListener('click', function() { 
        $('.change-state-switch').fadeIn(150);
    }, false);
});

$(document).ready(function(){
    document.getElementById('set-online').addEventListener('click', function() { 
        $('.profile-info-state').removeAttr('id');
        $('.profile-info-state').attr('id', 'online');
        $('.change-state-switch').fadeOut(150);
        document.getElementById('state-text').innerHTML = "Online";
    }, false);
});

$(document).ready(function(){
    document.getElementById('set-away').addEventListener('click', function() { 
        $('.profile-info-state').removeAttr('id');
        $('.profile-info-state').attr('id', 'away');
        $('.change-state-switch').fadeOut(150);
        document.getElementById('state-text').innerHTML = "Away";
    }, false);
});

$(document).ready(function(){
    document.getElementById('set-dnd').addEventListener('click', function() { 
        $('.profile-info-state').removeAttr('id');
        $('.profile-info-state').attr('id', 'dnd');
        $('.change-state-switch').fadeOut(150);
        document.getElementById('state-text').innerHTML = "DND";
    }, false);
});

function resize(){
    if (document.getElementById('full-mode-menu').style.display == "none"){
        document.getElementById('right-true-area').style.width = document.body.clientWidth + "px";
    }
    else
        document.getElementById('right-true-area').style.width = (document.body.clientWidth - 310) + "px";
    var optimal = ( document.body.clientHeight - 250 ) / 12;
    document.getElementById('scroll-dialogs').style.height = optimal * 8 + "px";
    document.getElementById('scroll-contacts').style.height = optimal * 4 + "px";
}


/* CHOOSE THEME */

function SetTheme(id){
    $('.active-theme').remove();
    $('#set-theme-' + id ).append('<div class="fl_r active-theme"></div>');
    
    swal("Good job!", "Selected theme now is active.", "success");
    setTimeout( function () {$('.wrap').attr('class', 'wrap theme_' + id);}, 100);
}


$(document).ready(function(){
    document.getElementById('show-settings').addEventListener('click', function() { 
        $('.setting-page').show("slide", { direction: "right", easing: 'easeInOutQuart' }, 500);
    }, false);
});

$(document).ready(function(){
    document.getElementById('close-settings').addEventListener('click', function() { 
        $('.setting-page').hide("slide", { direction: "right", easing: 'easeInOutQuart' }, 500);
    }, false);
});

function goCompact () {
        var head = document.getElementById('right-true-area');
        var width = document.body.clientWidth + "px";
        $('#full-mode-menu').hide("slide",{easing: "easeInOutQuart"}, 500, function () { 
            $('#compact-mode-menu').show();
            $('#compact-mode-menu').animate({left: "0%"}, 500);
        });
        $('#right-true-area').animate({width: width}, {duration: 500, easing: "easeInOutQuart"});
        $('#switch-mode').attr("onclick", "goFull()");
        $('.switch-mode').attr("id", "full-mode");
        $('.switch-text').attr("id", "full-text");
    }

function goFull () {
        var head = document.getElementById('right-true-area');
        var width = ( document.body.clientWidth - 310 ) + "px";
        $('#full-mode-menu').show("slide",{easing: "easeInOutQuart"}, 500);
        $('#right-true-area').animate({width: width}, {duration: 500, easing: "easeInOutQuart"});
        $('#compact-mode-menu').hide();
        document.getElementById('compact-mode-menu').style.left = -10 + "%";
        $('#switch-mode').attr("onclick", "goCompact()");
        $('.switch-mode').attr("id", "compact-mode");
        $('.switch-text').attr("id", "compact-text");
    }














