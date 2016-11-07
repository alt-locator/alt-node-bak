'use strict';

var gulp = require('gulp');
var spawn = require('child_process').spawn;

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

gulp.task('tsc', (done) => {
  runSpawn(done, 'node', ['node_modules/.bin/tsc']);
});

gulp.task('format:enforce', () => {
  let format = require('gulp-clang-format');
  let clangFormat = require('clang-format');
  return gulp.src(['lib/**/*.ts']).pipe(
    format.checkFormat('file', clangFormat, {verbose: true, fail: true}));
});

gulp.task('format', () => {
  let format = require('gulp-clang-format');
  let clangFormat = require('clang-format');
  return gulp.src(['lib/**/*.ts'], { base: '.' }).pipe(
    format.format('file', clangFormat)).pipe(gulp.dest('.'));
});

gulp.task('test', ['tsc', 'format:enforce']);
