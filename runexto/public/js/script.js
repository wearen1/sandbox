function open_advance (){
    var arrow = document.getElementById('icon_advance');

    $('#advance_search_options').slideDown(200);
    $('#advance').removeAttr('onclick');
    $('#advance').attr('onclick', 'close_advance()');
    arrow.style.transform = 'rotate(180deg)';
}

function close_advance (){
    var arrow = document.getElementById('icon_advance');

    $('#advance_search_options').slideUp(200);
    $('#advance').removeAttr('onclick');
    $('#advance').attr('onclick', 'open_advance()');
    arrow.style.transform = 'rotate(0deg)';
}

function open_live (){
    var arrow = document.getElementById('icon_live');

    $('#live_search_options').slideDown(200);
    $('#live').removeAttr('onclick');
    $('#live').attr('onclick', 'close_live()');
    arrow.style.transform = 'rotate(180deg)';
}

function close_live (){
    var arrow = document.getElementById('icon_live');

    $('#live_search_options').slideUp(200);
    $('#live').removeAttr('onclick');
    $('#live').attr('onclick', 'open_live()');
    arrow.style.transform = 'rotate(0deg)';
}

function check(type){
    if ( $('#'+type+'_check').attr('class') == null)
        $('#'+type+'_check').attr('class', 'checked');
    else
        $('#'+type+'_check').removeAttr('class');
}

// $(document).ready(function(){
//     document.getElementById('open-auth-box').addEventListener('click', function() { $('#auth-box').fadeIn(300); }, false);
// });

// $(document).ready(function(){
//     document.getElementById('close-auth-box').addEventListener('click', function() { $('#auth-box').fadeOut(300); }, false);
// });

// $(document).ready(function(){
//     document.getElementById('1to2').addEventListener('click', function() {
//         $('#auth-page-1').slideUp(600);
//         $('#auth-page-2').slideDown(600);
//     }, false);
// });

// $(document).ready(function(){
//     document.getElementById('2to1').addEventListener('click', function() {
//         $('#auth-page-2').slideUp(600);
//         $('#auth-page-1').slideDown(600);
//     }, false);
// });

// $(document).ready(function(){
//     document.getElementById('2to3').addEventListener('click', function() {
//         $('#auth-page-2').slideUp(600);
//         $('#auth-page-3').slideDown(600);
//     }, false);
// });

// $(document).ready(function(){
//     document.getElementById('3to2').addEventListener('click', function() {
//         $('#auth-page-3').slideUp(600);
//         $('#auth-page-2').slideDown(600);
//     }, false);
// });

// $(document).ready(function(){
//     document.getElementById('3to4').addEventListener('click', function() {
//         $('#auth-page-3').slideUp(600);
//         $('#auth-page-4').slideDown(600);
//     }, false);
// });

// $(document).ready(function(){
//     document.getElementById('4to3').addEventListener('click', function() {
//         $('#auth-page-4').slideUp(600);$('#auth-page-3').slideDown(600);
//     }, false);
// });

function importcheck (){
    if ( $('#import_check').attr('class') == null){
        $('#import_check').attr('class', 'checked');
        $('#first-name').attr('disabled', 'disabled');
        $('#last-name').attr('disabled', 'disabled');
    }
    else{
        $('#import_check').removeAttr('class');
        $('#first-name').removeAttr('disabled');
        $('#last-name').removeAttr('disabled');
    }
}

function down(e){
    e.preventDefault();
    if ($(e.currentTarget).hasClass('vkontakte'))
        $('.fl_l.result.vkontakte:visible').slideUp(400).next().slideDown(400);
    else
        $('.fl_l.result.twitter:visible').slideUp(400).next().slideDown(400);
}

function up(e){
    e.preventDefault();
    if ($(e.currentTarget).hasClass('vkontakte')){
        $('.fl_l.result.vkontakte:visible').slideUp(400).prev().slideDown(400);
    }
    else {
        $('.fl_l.result.twitter:visible').slideUp(400).prev().slideDown(400);
    }
}

$(document).ready(function(){

    $('.fl_r.actions > a').click(function(e){
        e.preventDefault();
        $.get($(e.currentTarget).attr('href'));
    });
    $('.fl_l.result.vkontakte:not(:first)').slideUp('fast');
    $('.fl_l.result.twitter:not(:first)').slideUp('fast');
    $('.arrow')
    .each(function(arrow, it){
        $(it).click(up);
    });
    $('.arrow.down')
    .each(function(arrow, it){
        $(it).click(down);
    });

        $(window).scroll(function(){
            var bo = $("body").scrollTop();
            if ( bo > 200 ) { $("#up").slideDown(400); } else { $("#up").slideUp(400); };
        })
    });

$(document).ready(function(){
        var height = $('.fl_l.one_tweet:first').height() * 2 ;
        $('#tweet-area').css('height', height + 'px');
    });


// function openVKmodal(i){
//     $("html,body").css("overflow","hidden");
//     $('.layout-vk:nth-child(' + (i + 1) + ')').fadeIn(1);

//     $('.fl_r.follow.vk-follow > a')
//     .click(function(e){
//         e.preventDefault();

//     });

//     var options = {
//         method: 'wall.getComments',
//         params: {
//             owner_id: '',
//             sort: 'asc',

//             q: 'mdk',
//             count: 3,
//             sort: 0,
//             v: 5.24
//         }
//     };

//     $.get('/api/' + encodeURIComponent(JSON.stringify(options)), function(data){
//         console.log(data);
//     });

// }

function openFBmodal(){
    $("html,body").css("overflow","hidden");
    $('#layout-fb').fadeIn(1);
}

function openWIKImodal(){
    $("html,body").css("overflow","hidden");
    // $('#layout-wiki').fadeIn(1);
    // $('#layout-wiki').fadeIn(1);
}

function closevkmodal(){
    $('#layout-vk').fadeOut(1);
    $("html,body").css("overflow","auto");
}

$(document).ready(function(){
    $('.close-box-button').click(function(){
            $('.layout-vk:not(:hidden)').fadeOut(1);
            // $("html,body").css("overflow","auto");
        });
});

$(document).ready(function(){
    document.getElementById('close-fb-box-button').addEventListener('click', function() { $('#layout-fb').fadeOut(1); $("html,body").css("overflow","auto"); }, false);
});

$(document).ready(function(){
    // document.getElementById('close-wiki-box-button').addEventListener('click', function() {$('#layout-wiki').fadeOut(1); $("html,body").css("overflow","auto"); }, false);
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
