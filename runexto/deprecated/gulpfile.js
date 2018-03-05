var gulp = require("gulp"),
    streamqueue = require("streamqueue"),
    concat = require("gulp-concat"),
    minifyCSS = require("gulp-minify-css"),
    uglify = require("gulp-uglify");


/**
 * Build app file (javascript)
 **/
gulp.task("js", function() {
    var stream = streamqueue({ objectMode: true });

    stream.queue(
        gulp.src(["public/js/vendors/jquery-1.11.min.js",
            "public/js/vendors/angular.min.js"])
    );

    // stream.queue(
    //     gulp
    //         .src(["public/js/vendors/*.js",
    //             "!public/js/vendors/*.min.js"
    //             ])
    //         .pipe(uglify({preserveComments: "some"}))
    // );

    stream.queue(
        gulp.src([
                "public/js/vendors/*.min.js",
                "!public/js/vendors/jquery-1.11.min.js",
                "!public/js/vendors/angular.min.js"
            ])
    );

    stream.queue(
        gulp.src([
            "public/js/vendors/*.js",
            "!public/js/vendors/*.min.js"
        ])
        .pipe(uglify({preserveComments: "some"}))
    );


    // precompile template and concat them into a virtual file (vinyl)
    // stream.queue(
    //     gulp
    //         .src("public/templates/*.hbs")
    //         .pipe(handlebars({
    //             outputType: "browser"
    //         }))
    //         .pipe(uglify())
    // );

    // once preprocess ended, concat result into a real file
    return stream.done()
        .pipe(concat("scripts.js"))
        .pipe(gulp.dest("public/build/js/"));
});


gulp.task("css", function(){
    var stream = streamqueue({ objectMode: true });
            // .pipe(minifyCSS())

    stream.queue(
        gulp
            .src(["public/css/**/*.css", 
                "!public/css/themes/**"
                ])
            .pipe(concat("bundle.css"))
            );
    return stream.done()
        .pipe(gulp.dest("public/build/css/"));
});

gulp.task("fonts", function(){
    var stream = streamqueue({ objectMode: true });
    // .pipe(minifyCSS())

    stream.queue(
        gulp
        .src(["public/fonts/**/*"
        ])
    );
    return stream.done()
    .pipe(gulp.dest("public/build/fonts/"));
});

/**
 * Watch files modifications and rebuild
 **/
gulp.task("watch", function() {
    // gulp.start("js");
    // gulp.start("css");

    gulp.watch(["./public/**/*", "!./public/build/**/*"], function() {
        gulp.start("js");
        gulp.start("css");
        gulp.start("fonts");
    });
});