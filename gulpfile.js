'use strict';

const $ = require('gulp');
const $changed = require('gulp-changed');
const $flatmap = require('gulp-flatmap');
const $htmlmin = require('gulp-htmlmin');
const $jsonminify = require('gulp-jsonminify');
const $mustache = require('gulp-mustache');
const $plumber = require('gulp-plumber');
const $postcss = require('gulp-postcss');
const $rename = require('gulp-rename');
const $sass = require('gulp-sass');

const del = require('del');
const fs = require('fs');
const path = require('path');
const server = require('browser-sync').create();

$sass.compiler = require('node-sass');

$.task('build', $.series(clean, $.parallel(pages, styles, justcopy)));
$.task('default', $.series('build', $.parallel(serve, watch)));
$.task('publish', publish);

function clean() {
  return del(['build']);
}

function reload(done) {
  server.reload();
  done();
}

function watch() {
  $.watch(['**/*.sass', '!node_modules/**/*'], $.series(styles, reload));
  $.watch(
      ['**/img/*', '!node_modules/**/*', 'CNAME', 'keybase.txt'],
      $.series(justcopy, reload));
  $.watch(
      ['**/*.mustache', '!node_modules/**/*', '**/*.json'],
      $.series(pages, reload));
}

function serve(done) {
  server.init({server: 'build'});
  done();
}

function pages() {
  return $.src(['**/*.mustache', '!node_modules/**/*'])
      .pipe($changed('build', {extention: '.html'}))
      .pipe($plumber())
      .pipe($flatmap((stream, file) => {
        // var hello = file.contents.toString('utf8');
        // var contents = JSON.parse(file.contents.toString('utf8'));
        // console.log(JSON.stringify(file.path));
        const dataFile = path.join(path.dirname(file.path), 'data.json');
        if (fs.existsSync(dataFile)) {
          return stream.pipe($mustache(dataFile, {}, {}));
        }
        return stream;
      }))
      .pipe($rename(path => {
        path.extname = '.html';
      }))
      .pipe($htmlmin({
        removeComments: true,
        collapseWhitespace: true,
        removeEmptyAttributes: true,
        minifyJS: true,
        minifyCSS: true
      }))
      .pipe($.dest('build'));
}

function styles() {
  return $.src(['**/*.sass', '!node_modules/**/*'])
      .pipe($changed('build', {extention: '.css'}))
      .pipe($plumber())
      .pipe($sass().on('error', $sass.logError))
      .pipe($rename(path => {
        path.extname = '.css';
      }))
      .pipe($postcss([
        require('precss'), require('cssnano')({
          autoprefixer: {browsers: ['last 2 version'], add: true},
          discardComments: {removeAll: true}
        })
      ]))
      .pipe($.dest('build'));
}

function justcopy() {
  return $.src(['**/img/*', '!node_modules/**/*', 'CNAME', 'keybase.txt'])
      .pipe($changed('build'))
      .pipe($.dest('build/'));
}

function publish() {
  return $.src('./build/**/*').pipe($.dest('../master/'));
}
