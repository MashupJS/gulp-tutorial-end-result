
var onError = function(err) {
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

// ----------------------------------------------------------------
// Default Task
// ----------------------------------------------------------------
gulp.task('default', function () {
    runSequence('annotate', 'clean-dist', 'copy',
                ['coreservices', 'routeconfig', 'libs']);
});
