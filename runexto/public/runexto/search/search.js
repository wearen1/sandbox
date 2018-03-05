

$(document).ready(function(){
    $(window).scroll(function(){
        var bo = $("body").scrollTop();
        if ( bo > 200 ) { $("#up").slideDown(400); } else { $("#up").slideUp(400); };
    })
});

$(document).ready(function(){
    if ($('.one_tweet').length >= 2){
        var height = $('.one_tweet')[0].clientHeight + $('.one_tweet')[1].clientHeight - 27;
        $('#tweet-area').css('height', height + 'px');
    } else
        $('#tweet-area').css('height', 199*2-27 + 'px');
});

function openVKmodal(){
    $("html,body").css("overflow","hidden");
    $('#layout-vk').fadeIn(1);
}

function openFBmodal(){
    $("html,body").css("overflow","hidden");
    $('#layout-fb').fadeIn(1);
}

function openWIKImodal(){
    $("html,body").css("overflow","hidden");
    // $('#layout-wiki').css
      // display:
    // $('#layout-wiki').fadeIn(1);
    $('#layout-wiki').removeAttr('style');
}

function closevkmodal(){
    $('#layout-vk').fadeOut(1);
    $("html,body").css("overflow","auto");
}

$(document).ready(function(){
    document.getElementById('close-vk-box-button').addEventListener('click', function() { $('#layout-vk').fadeOut(1); $("html,body").css("overflow","auto"); }, false);
});

$(document).ready(function(){
    document.getElementById('close-fb-box-button').addEventListener('click', function() { $('#layout-fb').fadeOut(1); $("html,body").css("overflow","auto"); }, false);
});

$(document).ready(function(){
    document.getElementById('close-wiki-box-button').addEventListener('click', function() { $('#layout-wiki').fadeOut(1); $("html,body").css("overflow","auto"); }, false);
});

$(document).ready(function(){
    document.getElementById('box-likeit').addEventListener('click', function() {
        $('#box-noactive-like').attr('id', 'box-active-like');
        document.getElementById('box-likeit').style.background = "#597da3";
        document.getElementById('box-like-count').style.color = "#fff";
        $('#box-likeit').attr('id', 'box-nolikeit');
    }, false);
});

$(document).ready(function(){
    document.getElementById('box-repostit').addEventListener('click', function() {
        $('#box-noactive-repost').attr('id', 'box-active-repost');
        document.getElementById('box-repostit').style.background = "#597da3";
        document.getElementById('box-repost-count').style.color = "#fff";
        $('#box-repostit').attr('id', 'box-norepostit');
    }, false);
});

$(document).ready(function(){
    document.getElementById('box-likeit-fb').addEventListener('click', function() {
        $('#box-noactive-like-fb').attr('id', 'box-active-like-fb');
        document.getElementById('box-likeit-fb').style.background = "#3b5998";
        document.getElementById('box-like-count-fb').style.color = "#fff";
        $('#box-likeit-fb').attr('id', 'box-nolikeit-fb');
    }, false);
});

$(document).ready(function(){
    document.getElementById('box-repostit-fb').addEventListener('click', function() {
        $('#box-noactive-repost-fb').attr('id', 'box-active-repost-fb');
        document.getElementById('box-repostit-fb').style.background = "#3b5998";
        document.getElementById('box-repost-count-fb').style.color = "#fff";
        $('#box-repostit-fb').attr('id', 'box-norepostit-fb');
    }, false);
});
