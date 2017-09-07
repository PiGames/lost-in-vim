let doc = document;

/*
const titleText = '🏠 bartoszlegiec — -bash — 80×24';
const win = window.open( "", titleText, "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, height=450, width=650, centerscreen=yes" );

const $winDoc = win.document;

const title = $winDoc.createElement( "title" );
title.innerHTML = titleText;

$winDoc.head.appendChild( title );

const style = document.querySelector( "style" );
$winDoc.head.appendChild( style.cloneNode( true ) );
$winDoc.body.innerHTML = document.body.innerHTML;
doc = $winDoc;

win.focus();
*/

const qs = _ => doc.querySelector( _ );

const input = qs( '#i' );
const firstLine = qs( '#m p:last-of-type' );
let textField = firstLine.querySelector( 'span' );

const sampleLine = firstLine.cloneNode( true );
sampleLine.removeAttribute( 'id' );

input.addEventListener( 'input', () => {
  textField.innerHTML = input.value;
} );

const addNewLine = ( msg ) => {
  let text = msg;
  if ( typeof msg === 'object' ) {
    text = msg.text;
  }

  const newLine = document.createElement( 'p' );
  newLine.innerHTML = '';

  if ( msg && msg.dir ) {
    newLine.innerHTML = 'MacBook-Pro-Maciek:~ bartoszlegiec$&nbsp;';
  }

  const span = document.createElement( 'span' );
  span.innerHTML = text || '';

  newLine.appendChild( span );

  qs( '#m' ).appendChild( newLine );

  return span;
};


const commandHandler = cmd => {
  switch ( cmd ) {
  case 'clear':
    return Array( 50 ).fill( '&nbsp;' );
  case '':
    return;
  default:
    return [ `-bash: ${cmd}: command not found` ];
  }
};

const keydown = ( e ) => {
  if ( e.keyCode === 13 ) {
    const response = commandHandler( input.value );
    if ( response && response.length > 0 ) {
      response.forEach( ( msg ) => {
        addNewLine( msg );
      } );
    }

    textField = addNewLine( { dir: true } );
    input.value = '';
    textField.scrollIntoView();
  }
};

input.addEventListener( 'keydown', keydown );
