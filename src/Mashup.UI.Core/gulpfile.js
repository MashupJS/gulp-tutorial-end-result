var onError = function (err) {
    console.log(err);
};

var gulp = require('gulp')
    , uglify                = require('gulp-uglify')
    , rename                = require('gulp-rename')
    , sourcemaps            = require('gulp-sourcemaps')
    , runSequence           = require('run-sequence')
    , plumber               = require('gulp-plumber')
    , ngAnnotate            = require('gulp-ng-annotate')
    , clean                 = require('gulp-clean')
    , newer                 = require('gulp-newer')
    , concat                = require('gulp-concat')
    , rename                = require('gulp-rename')
    , uglify                = require('gulp-uglify')
    , sourcemaps            = require('gulp-sourcemaps')
    , minifycss             = require('gulp-minify-css')
    , minifyhtml            = require('gulp-minify-html')
    , imagemin              = require('gulp-imagemin')
    , pngquant              = require('imagemin-pngquant')
    , jshint                = require('gulp-jshint')
    , stylish               = require('jshint-stylish')
    , jshinthtmlreporter    = require('gulp-jshint-html-reporter')
    , ts                    = require('gulp-typescript')
    , tslint                = require('gulp-tslint')
    , tsstylish             = require('gulp-tslint-stylish')
    , sass                  = require('gulp-sass')
    , watch                 = require('gulp-watch')

;

gulp.task('annotate', function () {
    return gulp.src(['src/index.controller.js', 'src/core/**/*.js', 'src/apps/**/*.js', '!src/core/lib/**/*', '!src/**/*.min.js'], { base: 'src/./' })
      .pipe(plumber({
          errorHandler: onError
      }))
      .pipe(ngAnnotate())
      .pipe(gulp.dest('src/./'));
});

gulp.task('clean-dist', function () {
    return gulp.src('dist', { read: false })
      .pipe(plumber({
          errorHandler: onError
      }))
      .pipe(clean());
});

gulp.task('copy', function () {
    return gulp.src('src/**/*')
      .pipe(plumber({
          errorHandler: onError
      }))
    .pipe(newer('dist')) 
    .pipe(gulp.dest('dist'));
});

gulp.task('coreservices', function () {
    return gulp.src('src/core/common/**/*')
      .pipe(plumber({
          errorHandler: onError
      }))
      .pipe(concat('core.services.js'))
      .pipe(gulp.dest('./dist/'));
});

gulp.task('routeconfig', function () {
    return gulp.src(['src/core/config/route.config.js', 'src/apps/**/route.config.js'])
      .pipe(plumber({
          errorHandler: onError
      }))
      .pipe(concat('route.config.js'))
      .pipe(gulp.dest('./dist/'));
});

gulp.task('libs', function () {
    return gulp.src(['bower_components/**/*.js'])
      .pipe(plumber({
          errorHandler: onError
      }))
      .pipe(concat('libs.js'))
      .pipe(gulp.dest('dist/core/lib/'));
});

gulp.task('uglifyalljs', function () {
    //gulp.task('uglifyalljs', ['copy', 'coreservices', 'routeconfig', 'tscompile'], function () {
    return gulp.src(['dist/**/*.js', '!/**/*.min.js', '!dist/core/lib/**/*', '!dist/core/common/**/*'], { base: 'dist/./' })
      .pipe(plumber({
          errorHandler: onError
      }))
     .pipe(sourcemaps.init())
    //  .pipe(newer('dist/./'))
     .pipe(uglify())
     .pipe(rename({
         extname: '.min.js'
     }))
     .pipe(sourcemaps.write('./'))
     .pipe(gulp.dest('dist/./'));
});

gulp.task('minifycss', function () {
    return gulp.src(['dist/**/*.css', '!dist/**/*.min.css', '!dist/core/lib/**/*'], { base: 'dist/./' })
      .pipe(plumber({
          errorHandler: onError
      }))
     .pipe(sourcemaps.init())
     .pipe(minifycss())
     .pipe(rename({
         extname: '.min.css'
     }))
     .pipe(sourcemaps.write('./'))
     .pipe(gulp.dest('dist/./'));
});

gulp.task('minifyhtml', function () {
    return gulp.src(['dist/**/*.html', '!/**/*.min.html', '!dist/core/lib/**/*'], { base: 'dist/./' })
      .pipe(plumber({
          errorHandler: onError
      }))
     .pipe(sourcemaps.init())
     .pipe(minifyhtml())
     .pipe(rename({
         extname: '.min.html'
     }))
     .pipe(sourcemaps.write('./'))
     .pipe(gulp.dest('dist/./'));
});

gulp.task('minifyimage', function () {
    return gulp.src(['dist/**/*.{png,jpg,gif,ico}', '!dist/core/lib/**/*.*', '!dist/core/css/**/*.*'])
      .pipe(plumber({
          errorHandler: onError
      }))
    .pipe(imagemin({ progressive: true, optimizationLevel: 7, use: [pngquant()] }))
    .pipe(gulp.dest('dist/./'));
});

// -------------------------------------------------
// Grunt configuration
require('gulp-grunt')(gulp, {
    // These are the default options but included here for readability.
    base: null,
    prefix: 'grunt-',
    verbose: false
});
// -------------------------------------------------

gulp.task('jshint', function () {
    //gulp.task('jshint', ['copy', 'tscompile'], function () {
    return gulp.src(['./dist/**/*.js', '!dist/core/lib/**/*.*', '!**/*.min.js', '!dist/core/css/**/*.*'])
      .pipe(plumber({
          errorHandler: onError
      }))
      .pipe(jshint('.jshintrc'))
      .pipe(jshint.reporter(stylish))
      .pipe(jshint.reporter('gulp-jshint-html-reporter', { filename: 'jshint-output.html' }))
    ;
});


gulp.task('tscompile', function () {
    return gulp.src(['./dist/**/*.ts', '!dist/core/lib/**/*.*', '!dist/core/css/**/*.*'])
      .pipe(plumber({
          errorHandler: onError
      }))
    .pipe(sourcemaps.init())
    .pipe(ts({
        target: 'ES5',
        declarationFiles: false,
        noExternalResolve: true
    }))
    .pipe(rename({ extname: '.js' }))
    .pipe(gulp.dest('dist/./'));
});


gulp.task('tslint', function () {
    return gulp.src(['./dist/**/*.ts', '!dist/core/lib/**/*.*', '!dist/core/css/**/*.*'])
        .pipe(plumber({
            errorHandler: onError
        }))
        .pipe(tslint())
        .pipe(tslint.report('verbose', {
            emitError: false,
            sort: true,
            bell: true
        }));
});

gulp.task('sass', function () {
    gulp.src('./dist/**/*.scss', { base: 'dist/./' })
      .pipe(plumber({
          errorHandler: onError
      }))
        .pipe(sass())
        .pipe(gulp.dest('dist/./'));
});

// ---------------------------------------------------------------
// Watch specific tasks.  This is to support the use of newer.
// ---------------------------------------------------------------
gulp.task('watch:annotate', function () {
    return gulp.src(['src/index.controller.js', 'src/core/**/*.js', 'src/apps/**/*.js', '!src/core/lib/**/*', '!/**/*.min.js'], { base: 'src/./' })
      .pipe(plumber({
          errorHandler: onError
      }))
      .pipe(newer('src/./'))
      .pipe(ngAnnotate())
      .pipe(gulp.dest('src/./'));
});



// ----------------------------------------------------------------
// Default Task
// ----------------------------------------------------------------
gulp.task('default', function () {
    runSequence('annotate', 'clean-dist', 'copy',
                ['coreservices', 'routeconfig', 'libs', 'minifyhtml', 'minifyimage'
                    , 'grunt-merge-json:menu', 'jshint', 'tscompile', 'tslint', 'sass']
                , ['uglifyalljs', 'minifycss']
                ,'watch');
});



gulp.task('watch', function () {

    // ---------------------------------------------------------------
    // Watching JS files
    // ---------------------------------------------------------------
    // Copy all files except *.js files.
    gulp.watch(['src/**/*', '!src/**/*.js', '!bower_components/**.*'], function () { runSequence('copy'); });

    // Annotates and copies *.js files
    gulp.watch(['src/**/*.js',
        '!src/core/config/route.config.js', '!src/apps/**/route.config.js',
        '!bower_components/**/*.js'], function () { runSequence('watch:annotate', 'copy'); });

    // routeConfig file changes.
    gulp.watch(['src/core/config/route.config.js', 'src/apps/**/route.config.js'], function () { runSequence('routeconfig'); });

    // Uglify JS files
    gulp.watch(['dist/**/*.js', '!dist/**/*.min.js', '!dist/core/lib/**/*', '!dist/core/common/**/*'], function () { runSequence('uglifyalljs'); });


    // ---------------------------------------------------------------
    // Watching Bower components
    // ---------------------------------------------------------------        
    gulp.watch(['bower_components/**/*.js'], function () { runSequence('libs'); });
    // TODO: Add other bower component types like css, scss and images


    // ---------------------------------------------------------------
    // Watching css and scss files
    // ---------------------------------------------------------------
    gulp.watch(['dist/**/*.css', '!dist/**/*.min.css', '!dist/core/lib/**/*'], function () { runSequence('minifycss'); });
    gulp.watch(['dist/**/*.scss', '!dist/core/lib/**/*'], function () { runSequence('sass'); });

    // ---------------------------------------------------------------
    // Watching TypeScript files
    // ---------------------------------------------------------------
    gulp.watch(['dist/**/*.ts', '!dist/core/lib/**/*.*', '!dist/core/css/**/*.*'], function () { runSequence('tscompile'); });

    // ---------------------------------------------------------------
    // Watch - Execute linters
    // ---------------------------------------------------------------
    gulp.watch(['dist/**/*.ts', '!dist/core/lib/**/*.*', '!dist/core/css/**/*.*'], function () { runSequence('tslint'); });
    //gulp.watch(['dist/**/*.js', '!dist/core/lib/**/*.*', '!dist/**/*.min.js', '!dist/core/css/**/*.*'], function() { runSequence('jshint'); });


    gulp.watch(['dist/**/*.js', '!dist/core/lib/**/*.*', '!dist/**/*.min.js', '!dist/core/css/**/*.*'], ['jshint']);

    // ---------------------------------------------------------------
    // Watching image files
    // ---------------------------------------------------------------
    // unable to get this watch to ever notice a file changed.  This will be handled on the initial build.
    //gulp.watch(['dist/**/*.{png,jpg,gif,ico}', '!dist/core/lib/**/*.*', '!dist/core/css/**/*.*'], function() { runSequence('minifyimage'); });

});