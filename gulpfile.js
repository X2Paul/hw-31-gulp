const { src, dest, watch, task } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const csscomb = require('gulp-csscomb');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries')

const PATH = {
    scssRootFile: './assets/scss/style.scss',
    scssAllFiles: './assets/scss/**/*.scss',
    scssFolder: './assets/scss',
    cssFolder: './assets/css',
    htmlFolder: './',
    htmlAllFilesFolder: './*.html',
    jsFolder: './assets/js',
    jsAllFilesFolder: './assets/js/**/*.js',
}

const PLUGINS = [
    autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true
    }),
    mqpacker({ sort: sortCSSmq })
]

function compileScss() {
    return src(PATH.scssRootFile)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(PLUGINS))
        .pipe(dest(PATH.cssFolder))
        .pipe(browserSync.stream());
}

function compileScssDev() {
    const pluginsForDevMode = [...PLUGINS]
    pluginsForDevMode.splice(0, 1)

    return src(PATH.scssRootFile, { sourcemaps: true })
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(pluginsForDevMode))
        .pipe(dest(PATH.cssFolder, { sourcemaps: true }))
        .pipe(browserSync.stream());
}

function compileScssMin() {
    const pluginsForMinify = [...PLUGINS, cssnano({ preset: 'default' })]
    return src(PATH.scssRootFile)
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(pluginsForMinify))
        .pipe(rename({ suffix: '.min' }))
        .pipe(dest(PATH.cssFolder))
}

function comb() {
    return src(PATH.scssAllFiles)
        .pipe(csscomb(PLUGINS))
        .pipe(dest(PATH.scssFolder))
}

function syncInit() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
}

async function sync() {
    browserSync.reload()
}

function watchFiles() {
    syncInit();
    watch(PATH.scssAllFiles, compileScss);
    watch(PATH.htmlAllFilesFolder, sync);
    watch(PATH.jsAllFilesFolder, sync);
}

task('dev', compileScssDev);
task('min', compileScssMin);
task('scss', compileScss);
task('comb', comb);
task('watch', watchFiles);
