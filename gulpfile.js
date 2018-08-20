'use strict'

const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const cp = require('child_process')
const $ = require('gulp-load-plugins')()
const del = require('del')
const browserSync = require('browser-sync')
const reload = browserSync.reload
const watchify = require('watchify')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const Vinyl = require('vinyl')
const sourcemaps = require('gulp-sourcemaps')
const log = require('fancy-log')
const exit = require('gulp-exit')
const rev = require('gulp-rev')
const revReplace = require('gulp-rev-replace')
const SassString = require('node-sass').types.String
const notifier = require('node-notifier')
const historyApiFallback = require('connect-history-api-fallback')
const through = require('through2')
const safeLoadFront = require('yaml-front-matter').safeLoadFront
const kebabcase = require('lodash.kebabcase')

// /////////////////////////////////////////////////////////////////////////////
// --------------------------- Variables -------------------------------------//
// ---------------------------------------------------------------------------//

// The package.json
var pkg

// Environment
// Set the correct environment, which controls what happens in config.js
if (!process.env.DS_ENV) {
  if (!process.env.CIRCLE_BRANCH || process.env.CIRCLE_BRANCH !== process.env.PRODUCTION_BRANCH) {
    process.env.DS_ENV = 'staging'
  } else {
    process.env.DS_ENV = 'production'
  }
}

var prodBuild = false

// /////////////////////////////////////////////////////////////////////////////
// ------------------------- Helper functions --------------------------------//
// ---------------------------------------------------------------------------//

function readPackage () {
  pkg = JSON.parse(fs.readFileSync('package.json'))
}
readPackage()

// /////////////////////////////////////////////////////////////////////////////
// ------------------------- Callable tasks ----------------------------------//
// ---------------------------------------------------------------------------//

gulp.task('default', ['clean'], function () {
  prodBuild = true
  gulp.start('build')
})

gulp.task('serve', ['vendorScripts', 'javascript', 'styles', 'content', 'tags'], function () {
  browserSync({
    port: 3000,
    server: {
      baseDir: ['.tmp', 'app', 'dist'],
      routes: {
        '/node_modules': './node_modules'
      },
      middleware: [
        historyApiFallback()
      ]
    }
  })

  // watch for changes
  gulp.watch([
    'app/*.html',
    'app/assets/graphics/**/*',
    '!app/assets/graphics/collecticons/**/*',
    'app/assets/content/pages/**'
  ]).on('change', reload)

  gulp.watch('app/assets/styles/**/*.scss', ['styles'])
  gulp.watch('package.json', ['vendorScripts'])
  gulp.watch('app/assets/graphics/collecticons/**', ['collecticons'])

  gulp.watch('app/assets/content/projects/**/*', ['content', 'tags'])
    .on('end', reload)
})

gulp.task('clean', function () {
  return del(['.tmp', 'dist'])
    .then(function () {
      $.cache.clearAll()
    })
})

// /////////////////////////////////////////////////////////////////////////////
// ------------------------- Browserify tasks --------------------------------//
// ------------------- (Not to be called directly) ---------------------------//
// ---------------------------------------------------------------------------//

// Compiles the user's script files to bundle.js.
// When including the file in the index.html we need to refer to bundle.js not
// main.js
gulp.task('javascript', function () {
  var watcher = watchify(browserify({
    entries: ['./app/assets/scripts/main.js'],
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true
  }), {poll: true})

  function bundler () {
    if (pkg.dependencies) {
      watcher.external(Object.keys(pkg.dependencies))
    }
    return watcher.bundle()
      .on('error', function (e) {
        notifier.notify({
          title: 'Oops! Browserify errored:',
          message: e.message
        })
        console.log('Javascript error:', e)
        if (prodBuild) {
          process.exit(1)
        }
        // Allows the watch to continue.
        this.emit('end')
      })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      // Source maps.
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('.tmp/assets/scripts'))
      .pipe(reload({stream: true}))
  }

  watcher
    .on('log', log)
    .on('update', bundler)

  return bundler()
})

// Vendor scripts. Basically all the dependencies in the package.js.
// Therefore be careful and keep the dependencies clean.
gulp.task('vendorScripts', function () {
  // Ensure package is updated.
  readPackage()
  var vb = browserify({
    debug: true,
    require: pkg.dependencies ? Object.keys(pkg.dependencies) : []
  })
  return vb.bundle()
    .on('error', log.bind(log, 'Browserify Error'))
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('.tmp/assets/scripts/'))
    .pipe(reload({stream: true}))
})

// /////////////////////////////////////////////////////////////////////////////
// ------------------------- Collecticon tasks -------------------------------//
// --------------------- (Font generation related) ---------------------------//
// ---------------------------------------------------------------------------//
gulp.task('collecticons', function (done) {
  var args = [
    'node_modules/collecticons-processor/bin/collecticons.js',
    'compile',
    'app/assets/graphics/collecticons/',
    '--font-embed',
    '--font-dest', 'app/assets/fonts',
    '--font-name', 'Collecticons',
    '--font-types', 'woff',
    '--style-format', 'sass',
    '--style-dest', 'app/assets/styles/core/',
    '--style-name', 'collecticons',
    '--class-name', 'collecticon',
    '--author-name', 'Development Seed',
    '--author-url', 'https://developmentseed.org/',
    '--no-preview'
  ]

  return cp.spawn('node', args, {stdio: 'inherit'})
    .on('close', done)
})

// //////////////////////////////////////////////////////////////////////////////
// --------------------------- Helper tasks -----------------------------------//
// ----------------------------------------------------------------------------//

gulp.task('build', ['vendorScripts', 'javascript', 'content', 'tags'], function () {
  gulp.start(['html', 'images', 'extras'], function () {
    return gulp.src('dist/**/*')
      .pipe($.size({title: 'build', gzip: true}))
      .pipe(exit())
  })
})

gulp.task('styles', function () {
  return gulp.src('app/assets/styles/main.scss')
    .pipe($.plumber(function (e) {
      notifier.notify({
        title: 'Oops! Sass errored:',
        message: e.message
      })
      console.log('Sass error:', e.toString())
      if (prodBuild) {
        process.exit(1)
      }
      // Allows the watch to continue.
      this.emit('end')
    }))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      outputStyle: 'expanded',
      precision: 10,
      functions: {
        'urlencode($url)': function (url) {
          var v = new SassString()
          v.setValue(encodeURIComponent(url.getValue()))
          return v
        }
      },
      includePaths: require('node-bourbon').with('node_modules/jeet')
    }))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('.tmp/assets/styles'))
    .pipe(reload({stream: true}))
})

gulp.task('html', ['styles'], function () {
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    // Do not compress comparisons, to avoid MapboxGLJS minification issue
    // https://github.com/mapbox/mapbox-gl-js/issues/4359#issuecomment-286277540
    .pipe($.if('*.js', $.uglify({compress: {comparisons: false}})))
    .pipe($.if('*.css', $.csso()))
    .pipe($.if(/\.(css|js)$/, rev()))
    .pipe(revReplace())
    .pipe(gulp.dest('dist'))
})

gulp.task('images', function () {
  return gulp.src('app/assets/graphics/**/*')
    .pipe($.cache($.imagemin([
      $.imagemin.gifsicle({interlaced: true}),
      $.imagemin.jpegtran({progressive: true}),
      $.imagemin.optipng({optimizationLevel: 5}),
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      $.imagemin.svgo({plugins: [{cleanupIDs: false}]})
    ])))
    .pipe(gulp.dest('dist/assets/graphics'))
})

gulp.task('extras', function () {
  return gulp.src([
    'app/**/*',
    '!app/*.html',
    '!app/assets/graphics/**',
    '!app/assets/vendor/**',
    '!app/assets/styles/**',
    '!app/assets/scripts/**'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
})

// /////////////////////////////////////////////////////////////////////////////
// ------------------------ Content related tasks ----------------------------//
// ---------------------------------------------------------------------------//

// Create an json index of all projects for the homepage navigation.
gulp.task('content', function () {
  return gulp.src('app/assets/content/projects/**/*.md')
    .pipe(createPorjectsIndex('projects.json'))
    .pipe(gulp.dest('dist/assets/content'))
})

// Index the tags in the projects. This is used by the RRA to show the
// autocomplete options.
gulp.task('tags', function () {
  return gulp.src('app/assets/content/projects/**/*.md')
    .pipe(extractTags())
    .pipe(gulp.dest('dist/assets/content'))
})

function createPorjectsIndex (name) {
  let index = []

  return through.obj(function (file, enc, cb) {
    let content = safeLoadFront(file.contents.toString('utf8'))
    content.__path = path.relative(path.resolve(__dirname, 'app'), file.path)
    // The id is the folder name in the path.
    // app/assets/content/projects/project-1/index.md -> project-1
    const pieces = file.path.split('/')
    content.id = pieces[pieces.length - 2]
    // The file content is not needed for the cards.
    delete content.__content
    index.push(content)
    cb()
  }, cb => {
    cb(null, new Vinyl({
      cwd: __dirname,
      base: path.join(__dirname, 'app/assets/content/projects'),
      path: path.join(__dirname, 'app/assets/content/projects', name),
      contents: Buffer.from(JSON.stringify({index}))
    }))
  })
}

function extractTags () {
  let tags = {
    authors: [],
    topics: []
  }

  function getUniqueTag (tName, content = []) {
    return content.reduce((acc, el) => {
      const id = kebabcase(el)
      return !tags[tName].find(t => t.id === id)
        ? acc.concat({ id, name: el })
        : acc
    }, [])
  }

  return through.obj(function (file, enc, cb) {
    let content = safeLoadFront(file.contents.toString('utf8'))
    content.__path = path.relative(path.resolve(__dirname, 'app'), file.path)

    ;['authors', 'topics'].forEach(element => {
      tags[element] = tags[element].concat(getUniqueTag(element, content[element]))
    })
    cb()
  }, function (cb) {
    this.push(new Vinyl({
      cwd: __dirname,
      base: path.join(__dirname, 'app/assets/content/projects'),
      path: path.join(__dirname, 'app/assets/content/projects', 'topics.json'),
      contents: Buffer.from(JSON.stringify(tags.topics))
    }))
    this.push(new Vinyl({
      cwd: __dirname,
      base: path.join(__dirname, 'app/assets/content/projects'),
      path: path.join(__dirname, 'app/assets/content/projects', 'authors.json'),
      contents: Buffer.from(JSON.stringify(tags.authors))
    }))

    cb()
  })
}
