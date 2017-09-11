/* Postbuild from https://github.com/sz-piotr/js13k-webpack-starter (slightly changed) */

const fs = require( 'fs' );
const archiver = require( 'archiver' );

fs.unlinkSync( './dist/script.js' );
fs.unlinkSync( './dist/style.css' );


try {
  fs.unlinkSync( './dist/build.zip' );
} catch ( e ) {
  if ( e.code !== 'ENOENT' ) {
    console.error( e );
  }
}

let output = fs.createWriteStream( './dist/build.zip' );
let archive = archiver( 'zip', {
  zlib: { level: 9 },
} );


const maxBytes = 13312;
output.on( 'close', function() {
  const fileSize = archive.pointer();
  console.log( `${ fileSize }/${ maxBytes } total bytes\n${ Math.round( fileSize / maxBytes * 100 * 100 ) / 100 }% of space used` );
} );

archive.on( 'warning', function( err ) {
  if ( err.code === 'ENOENT' ) {
    console.warn( err );
  } else {
    throw err;
  }
} );

archive.on( 'error', function( err ) {
  throw err;
} );

archive.pipe( output );
archive.append(
  fs.createReadStream( './dist/index.html' ), {
    name: 'index.html',
  } );

archive.finalize();
