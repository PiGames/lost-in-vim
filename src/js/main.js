import { qs, doc } from './utils';

const input = () => qs( '#i' );

const GAME_STATES = {
  'PRE_VIM': 0,
  'VIM': 1,
  'AFTER_VIM': 2,
};

let CURRENT_GAME_STATE = GAME_STATES.PRE_VIM;

const PRE_VIM_COMMAND = 'git commit -a';

let LAST_TYPED_CHARACTER_INDEX = 0;

const firstLine = qs( '#m p:last-of-type' );
let textField = firstLine.querySelector( 'span' );

const addNewLine = ( msg ) => {
  let text = msg;
  if ( typeof msg === 'object' ) {
    text = msg.text;
  }

  const newLine = document.createElement( 'p' );
  newLine.innerHTML = '';

  if ( msg && msg.dir ) {
    if ( msg.dir === true ) {
      newLine.innerHTML = 'MacBook-Pro-Maciek:~ bartoszlegiec$&nbsp;';
    } else {
      newLine.innerHTML = msg.dir;
    }
  }

  if ( msg && msg.disabled ) {
    newLine.classList.add( 'disabled' );
  }

  if ( msg && msg.className ) {
    newLine.classList.add( msg.className );
  }

  const span = document.createElement( 'span' );
  span.innerHTML = text || '';

  newLine.appendChild( span );

  qs( '#m' ).appendChild( newLine );
  return span;
};

const commandHandler = cmd => new Promise( ( resolve ) => {
  switch ( cmd ) {
  case 'clear': {
    const newM = doc.createElement( 'label' );
    newM.appendChild( input() );
    newM.appendChild( qs( '#m p:last-of-type' ) );

    doc.body.appendChild( newM );
    doc.body.removeChild( qs( '#m' ) );
    newM.setAttribute( 'id', 'm' );
    newM.setAttribute( 'for', 'i' );
    newM.focus();

    input().value = '';
    textField.innerHTML = '';
    break;
  }

  case '': {
    resolve();

    break;
  }

  default: {
    resolve( [ `-bash: ${cmd}: command not found` ] );
  }
  }
} );

const onEnterPress = () => {
  commandHandler( input.value )
    .then( ( response ) => {
      if ( response && response.length > 0 ) {
        response.forEach( ( msg ) => {
          addNewLine( msg );
        } );
      }

      textField = addNewLine( { dir: true } );
      input.value = '';
      textField.scrollIntoView();
    } );
};

const consoleKeydown = ( e ) => {
  if ( e.keyCode === 13 ) {
    onEnterPress();
    return;
  }

};

const replaceSpan = () => {
  switch ( CURRENT_GAME_STATE ) {
  case GAME_STATES.PRE_VIM:
    input().value = PRE_VIM_COMMAND.substr( 0, ++LAST_TYPED_CHARACTER_INDEX );
  }
  textField.innerHTML = input().value;
};

const bindEvents = () => {
  input().addEventListener( 'input', replaceSpan );
  input().addEventListener( 'keydown', consoleKeydown );
};

bindEvents();
