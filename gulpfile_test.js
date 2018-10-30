var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var pug = require('gulp-pug');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var ftp = require('vinyl-ftp');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');

gulp.task('sass', function() {
	return gulp.src('src/style.sass') // Leer un archivo
		.pipe(plumber())
    	.pipe(sourcemaps.init())
		.pipe(sass()) // Compilar SASS
        .pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false})) // Autoprfixer
		.pipe(gulp.dest('.tmp')) // Guardar archivo
    	.pipe(sourcemaps.write())
		.pipe(reload({ stream: true })); // Enviar cambios al navegador
});

// Sass for production
gulp.task('sass:prod', function() {
	return gulp.src('src/style.sass')
		.pipe(plumber())
		.pipe(sass({ outputStyle: 'compressed'})) // Compilar SASS minificado
		.pipe(autoprefixer({ browsers: ['last 2 versions'], cascade: false})) // Autoprfixer
		.pipe(gulp.dest('dist'));
});

gulp.task('js', function() {
	gulp.src('./src/app.js')
		.pipe(plumber())
		.pipe(uglify({compress:true}))
		.pipe(gulp.dest('dist'))
});

 gulp.task('watch', function() {
	gulp.watch('src/style.sass', ['sass']);
  	gulp.watch('src/*.pug', ['pug:reload']);
  	gulp.watch('.tmp/*html').on('change', reload);
});

gulp.task('serve', ['sass', 'pug'], function() {
	browserSync({
		server: {
			baseDir: ['.tmp', 'src']
		}
	});
    gulp.start('watch');
}); 

gulp.task('pug', function() {
  return gulp.src('src/*.pug') // Utilizamos Glob para compilar todo .pug de la carpeta
  		.pipe(plumber())	
	  	.pipe(pug())
	  	.pipe(gulp.dest('.tmp'))
});

// Pug for production
gulp.task('pug:prod', function() {
  return gulp.src('src/*.pug')
  		.pipe(plumber())
	  	.pipe(pug())
	 	 .pipe(gulp.dest('dist'))
});

gulp.task('build', ['sass:prod', 'pug:prod', 'js']);

gulp.task('upload', ['build'], function() {
	var ftp = ftpConnection();
	var remoteFolder = '/_demos/acamica/demo-1-2/';
	return gulp.src('dist/**', { base: 'dist', buffer: false})
		.pipe(ftp.newer(remoteFolder))
		.pipe(ftp.dest(remoteFolder));
});

function ftpConnection() {
	return ftp.create({
		host: 'acamica.com',
		user: 'sergio',
		password: process.env.FTP_PWD,
		parallel: 5,
		log: gutil.log
	})
};