'use strict';

const clangFormat = require('clang-format');
const format = require('gulp-clang-format');
const gulp = require('gulp');
const spawn = require('child_process').spawn;
const tslint = require('gulp-tslint');


var runSpawn = (done, task, opt_arg, opt_io) => {
  opt_arg = typeof opt_arg !== 'undefined' ? opt_arg : [];
  var stdio = 'inherit';
  if (opt_io === 'ignore') {
    stdio = 'ignore';
  }
  var child = spawn(task, opt_arg, {stdio: stdio});
  var running = false;
  child.on('close', () => {
    if (!running) {
      running = true;
      done();
    }
  });
  child.on('error', () => {
    if (!running) {
      console.error('gulp encountered a child error');
      running = true;
      done();
    }
  });
};

gulp.task('format:enforce', () => {
  return gulp.src(['lib/**/*.ts']).pipe(
    format.checkFormat('file', clangFormat, {verbose: true, fail: true}));
});

gulp.task('format', () => {
  return gulp.src(['lib/**/*.ts'], { base: '.' }).pipe(
    format.format('file', clangFormat)).pipe(gulp.dest('.'));
});

gulp.task('tslint', () => {
  return gulp.src(['lib/**/*.ts', 'spec/**/*.ts'])
      .pipe(tslint()).pipe(tslint.report());
});
