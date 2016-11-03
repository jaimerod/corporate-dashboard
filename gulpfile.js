// Gulp plugins
const babel = require('gulp-babel');
const bower = require('gulp-bower');
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const notify = require('gulp-notify');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();

// Source Folders
const imageFolder = 'src/images';
const jsFolder = 'src/js';
const sassFolder = 'src/scss';

// Build Folders
const buildCssFolder = 'build/css';
const buildImageFolder = 'build/img';
const buildJsFolder = 'build/js';

const handleErrors = () => {
  const args = Array.prototype.slice.call(arguments);

  notify.onError({
    title: 'Compile Error',
    message: '<%= error.message %>'
  }).apply(this, args);

  this.emit('end');
}

/**
 * Runs by default
 */
gulp.task('default', [
  'bower',
  'copy',
  'images',
  'scripts',
  'styles'
], () => {});

/**
 * Compresses image files for production
 */
gulp.task('images', () => {
  gulp.src(imageFolder + '/*')
    .on('error', handleErrors)
    .pipe(imagemin())
    .pipe(gulp.dest(buildImageFolder))
    .pipe(browserSync.stream());
});

/**
 * Minifies JS files for production
 */
gulp.task('scripts', () => {
  gulp.src(jsFolder + '/*.js')
    .on('error', handleErrors)
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest(buildJsFolder))
    .pipe(browserSync.stream());
});

/**
 * Compiles SCSS to CSS and minifies CSS
 */
gulp.task('styles', () => {
  return gulp.src(sassFolder + '/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed'
    })
    .on('error', handleErrors))
    .pipe(sourcemaps.write('./', {
      includeContent: true,
      sourceRoot: './'
    }))
    .pipe(gulp.dest(buildCssFolder))
    .pipe(browserSync.stream());
});

gulp.task('serve', () => {
  browserSync.init({
      server: {
          baseDir: "build/"
      }
  });
});

/**
 * Install bower components\
 */
gulp.task('bower', function() {
  return bower({ directory: 'build/lib' })
    .pipe(gulp.dest('build/lib'))
});

/**
 * Copy the html files to the build directory
 */
gulp.task('copy', function () {
  return gulp.src([
    'src/**',
    '!' + sassFolder + '/**',
    '!' + imageFolder + '/**',
    '!' + jsFolder + '/**/*.js'
  ], {dot: true})
  .on('error', handleErrors)
  .pipe(gulp.dest('build'))
  .pipe(browserSync.stream());;
});

/**
 * Watches for changes in files and does stuff
 */
gulp.task('watch', ['copy', 'bower', 'scripts', 'styles', 'images'], () => {``
  gulp.watch(['src/**/*'], ['copy']);
  gulp.watch(['bower.json'], ['bower']);
  gulp.watch([jsFolder + '/**/*.js'], ['scripts']);
  gulp.watch([sassFolder + '/**/*.scss'], ['styles']);
  gulp.watch([imageFolder + '/**/*'], ['images']);
  gulp.run(['serve']);
});