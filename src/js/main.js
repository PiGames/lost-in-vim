import { qs } from './utils';
import { openVim } from './vim';
const titleText = '📁 lost-in-vim — -bash — 80×24';
const USER_NAME = 'js13k:~ lost-in-vim';
import asciipi from './pigame.txt';

if ( window.location.hash !== '#no' ) {
  const win = window.open( './index.html#no', titleText, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, height=450, width=650, centerscreen=yes' );

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
  'AFTER_PUSH': 3,
};

let CURRENT_GAME_STATE = GAME_STATES.PRE_VIM;
let AFTER_PUSH_COMMANDS_INDEX = 0;

const PRE_VIM_COMMAND = 'git commit -a';
const AFTER_VIM_COMMAND = 'git push';
const AFTER_PUSH_COMMANDS = [ 'echo "%0f0Congratulations, You have won!%fff"', 'credits' ];

let LAST_TYPED_CHARACTER_INDEX = 0;

const addNewLine = ( msg ) => {
  let text = msg;
  if ( typeof msg === 'object' ) {
    text = msg.text;
  }

  const newLine = document.createElement( 'p' );
  newLine.innerHTML = '';

  if ( msg && msg.dir ) {
    if ( msg.dir === true ) {
      newLine.innerHTML = `${ USER_NAME }&nbsp;`;
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

const handleGit = argument => {
  switch ( argument ) {
  case 'commit': {
    CURRENT_GAME_STATE = GAME_STATES.VIM;
    openVim( input, textField, addNewLine, focusP, tf => textField = tf, commandHandler, bindEvents, consoleKeydown, () => CURRENT_GAME_STATE = GAME_STATES.AFTER_VIM );
    return false;
  }
  case 'push': {
    CURRENT_GAME_STATE = GAME_STATES.AFTER_PUSH;
    return [
      'Counting objects: 4, done.',
      'Delta compression using up to 4 threads',
      'Compressing objects: 100% (4/4), done.',
      'Writing objects: 100% (4/4), 354 bytes | 0 bytes/s. done.',
      'Total 4 (delta 3), reused 0 (delta 0)',
      'remote: Resolving deltas: 100% (4/4), completed with 1 local object.',
      'To https://github.com/js13kGames/js13kgames.com.git',
      '63ad859..06b7dc0  master -> master',
    ];
  }
  }

};

const focusP = () => {
  document.querySelectorAll( '#m p' ).forEach( p => {
    p.classList.remove( 'current' );
  } );

  textField.parentNode.classList.add( 'current' );
};

let textField = addNewLine( { dir: true } );
focusP();

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

  case 'git': {
    LAST_TYPED_CHARACTER_INDEX = 0;
    console.log( args[ 0 ] );
    resolve = handleGit( args[ 0 ] );
    console.log( resolve );
    break;
  }
  case 'vim': {
    CURRENT_GAME_STATE = GAME_STATES.VIM;
    openVim( input, textField, addNewLine, focusP, tf => textField = tf, commandHandler, bindEvents, consoleKeydown, () => CURRENT_GAME_STATE = GAME_STATES.AFTER_VIM );
    break;
  }

  case 'echo': {
    resolve = args.join( ' ' ).replace( /\"/g, '' ).split( '\n' );
    break;
  }

  case 'credits': {
    resolve = asciipi.split( '\n' ).map( a => '%f06292' + a.replace( /\|/g, '&nbsp;' ) );
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

  if ( CURRENT_GAME_STATE === GAME_STATES.AFTER_PUSH ) {
    console.log( fullCmd.length, AFTER_PUSH_COMMANDS[ AFTER_PUSH_COMMANDS_INDEX ].length );

    if ( fullCmd.length === AFTER_PUSH_COMMANDS[ AFTER_PUSH_COMMANDS_INDEX ].length ) {
      AFTER_PUSH_COMMANDS_INDEX = Math.min( AFTER_PUSH_COMMANDS_INDEX + 1, AFTER_PUSH_COMMANDS.length - 1 );
    }

    LAST_TYPED_CHARACTER_INDEX = 0;
  }

  const colorise = ( msg ) => {
    const colpos = msg.search( /%[a-f0-9]{3,6}/ );
    const color = msg.match( /%([a-f0-9]{3,6})/ );

    if ( colpos < 0 ) {
      return msg;
    } else {
      const message = msg.substring( 0, colpos ) + `<span style="color: #${ color[ 1 ] }">` + msg.substring( colpos + color[ 0 ].length ) + '</span>';

      return colorise( message );
    }
  };

  if ( resolve !== false ) {
    if ( resolve && resolve.length > 0 ) {
      resolve.forEach( ( msg ) => {
        const message = colorise( msg );
        addNewLine( message );
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
  }

};

const consoleKeyup = function() {
  qs( '.current' ).style.setProperty( '--caret-offset', `${ getCaretPosition( this ) * 100 }%` );
};

const replaceSpan = () => {
  switch ( CURRENT_GAME_STATE ) {
  case GAME_STATES.PRE_VIM:
    input().value = PRE_VIM_COMMAND.substr( 0, ++LAST_TYPED_CHARACTER_INDEX );
    break;
  case GAME_STATES.AFTER_VIM:
    input().value = AFTER_VIM_COMMAND.substr( 0, ++LAST_TYPED_CHARACTER_INDEX );
    break;
  case GAME_STATES.AFTER_PUSH:
    input().value = AFTER_PUSH_COMMANDS[ AFTER_PUSH_COMMANDS_INDEX ].substr( 0, ++LAST_TYPED_CHARACTER_INDEX );
    break;
  }
  textField.innerHTML = input().value;
};

const bindEvents = () => {
  input().addEventListener( 'input', replaceSpan );
  input().addEventListener( 'keydown', consoleKeydown );
  input().addEventListener( 'keyup', consoleKeyup );
};

bindEvents();
