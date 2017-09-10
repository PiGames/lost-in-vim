import { qs } from './utils';
import { openVim } from './vim';
const titleText = '🏠 bartoszlegiec — -bash — 80×24';

if ( window.location.hash !== '#no' ) {
  const win = window.open( './#no', titleText, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, height=450, width=650, centerscreen=yes' );

  win.focus();
}

const title = document.createElement( 'title' );
title.innerHTML = titleText;
document.head.appendChild( title );

if ( process.env.NODE_ENV !== 'production' ) {
  document.body.classList.add( 'debug' );
}

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

const focusP = () => {
  document.querySelectorAll( '#m p' ).forEach( p => {
    p.classList.remove( 'current' );
  } );

  textField.parentNode.classList.add( 'current' );
};

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

const commandHandler = fullCmd => {
  let resolve = false;

  const [ cmd, ...args ] = fullCmd.split( ' ' );
  focusP();

  switch ( cmd ) {
  case 'clear': {
    const newM = document.createElement( 'label' );
    newM.appendChild( input() );
    newM.appendChild( qs( '#m p:last-of-type' ) );

    document.body.appendChild( newM );
    document.body.removeChild( qs( '#m' ) );
    newM.setAttribute( 'id', 'm' );
    newM.setAttribute( 'for', 'i' );
    newM.focus();

    input().value = '';
    textField.innerHTML = '';
    break;
  }

  case 'git':
  case 'vim': {
    CURRENT_GAME_STATE = GAME_STATES.VIM;
    openVim( input, textField, addNewLine, focusP, tf => textField = tf, commandHandler, bindEvents, consoleKeydown );
    break;
  }

  case 'echo': {
    resolve = args.join( ' ' ).split( '\n' );
    break;
  }

  case '': {
    resolve = null;
    break;
  }

  default: {
    resolve = [ `-bash: ${ cmd }: command not found` ];
  }
  }

  if ( resolve !== false ) {
    if ( resolve && resolve.length > 0 ) {
      resolve.forEach( ( msg ) => {
        addNewLine( msg );
      } );
    }

    textField = addNewLine( { dir: true } );
    input().value = '';
    textField.scrollIntoView();
    focusP();
  }
};

const getCaretPosition = ( oField ) => {
  let iCaretPos = 0;

  if ( document.selection ) {
    oField.focus();

    const oSel = document.selection.createRange();

    oSel.moveStart( 'character', -oField.value.length );

    iCaretPos = oSel.text.length;
  } else if ( oField.selectionStart || oField.selectionStart == '0' ) {
    iCaretPos = oField.selectionStart;
  }

  return iCaretPos;
};

const consoleKeydown = ( e ) => {
  if ( e.keyCode === 13 ) {
    commandHandler( input().value );
    return;
  }

};

const consoleKeyup = function() {
  qs( '.current' ).style.setProperty( '--caret-offset', `${ getCaretPosition( this ) * 100 }%` );
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
  input().addEventListener( 'keyup', consoleKeyup );
};

bindEvents();
