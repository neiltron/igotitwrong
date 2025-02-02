// generated on 2016-07-21 using generator-webapp 2.1.0
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const request = require('request');
const browserSync = require('browser-sync');
const del = require('del');
const browserify = require('browserify');
const babelify = require('babelify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');


const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('app/styles/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  const b = browserify({
    entries: 'app/scripts/main.js',
    transform: babelify,
    debug: true
  });

  return b.bundle()
    .pipe(source('bundle.js'))
    .pipe($.plumber())
    .pipe(buffer())
    .pipe($.sourcemaps.init({loadMaps: true}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

gulp.task('assets', () => {
  return gulp.src('app/assets/**/*')
    .pipe(gulp.dest('.tmp/assets'))
    .pipe(gulp.dest('dist/assets'));
});

function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('app/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest('app/scripts'));
});
gulp.task('lint:test', () => {
  return lint('test/spec/**/*.js', {
    fix: true,
    env: {
      mocha: true
    }
  })
    .pipe(gulp.dest('test/spec/**/*.js'));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
    //.pipe($.if('*.html', $.htmlmin({collapseWhitespace: true}))) <- Facebook doesn't parse OG tags with this
    .pipe(gulp.dest('dist'));
});

gulp.task('images', () => {
  return gulp.src('app/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

gulp.task('extras', () => {
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app']
    }
  });

  gulp.watch([
    'app/*.html',
    'app/images/**/*'
  ]).on('change', reload);

  gulp.watch('app/styles/**/*.scss', ['styles']);
  gulp.watch([
    'app/scripts/**/*.js',
    'app/scripts/**/*.frag',
    'app/scripts/**/*.vert'
  ], ['scripts']);
});

gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', ['scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/bower_components': 'bower_components'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

gulp.task('deploy', ['build'], function() {
  return gulp.src('./dist/**/*')
    .pipe($.ghPages());
});

gulp.task('push-s3', ['build'], function() {
  var awsConfig = {
    accessKeyId: '',
    secretAccessKey: '',
  };

  if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
    throw new Error('AWS config not specified. Edit the `push-s3` task in gulpfile.js!');
  }

  var aws = $.awspublish;
  var publisher = aws.create({
    region: 'us-east-1',
    params: {
      Bucket: 'igotitwrong.com'
    },
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  });

  var headers = {
    'Cache-Control': 'max-age=2592000, no-transform, public'
  };

  return gulp.src('./dist/**/*')
    .pipe(publisher.publish(headers, { force: true }))
    .pipe(aws.reporter());
});

gulp.task('publish', ['push-s3'], function() {
  var cloudflareConfig = {
    apiKey: '',
    email: '',
    zoneId: '',
  };

  if (!cloudflareConfig.apiKey || !cloudflareConfig.email || !cloudflareConfig.zoneId) {
    throw new Error('Cloudflare config not specified. Edit the `publish` task in gulpfile.js!');
  }

  return request({
    method: 'DELETE',
    url: `https://api.cloudflare.com/client/v4/zones/${cloudflareConfig.zoneId}/purge_cache`,
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Key': cloudflareConfig.apiKey,
      'X-Auth-Email': cloudflareConfig.email,
    },
    body: JSON.stringify({ purge_everything: true }),
  }).pipe(process.stdout);
});

gulp.task('build', ['lint', 'html', 'images', 'extras', 'assets'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], () => {
  gulp.start('build');
});
