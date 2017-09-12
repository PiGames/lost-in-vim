import { qs } from './utils';
const savedState = {};
let data = {};

let isInputModeOn = true;
let isCommandLineActive = false;
let disableInput = false;

const EXITING_VIM_COMBINATIONS = [
  'wq', 'q', 'q!',
];

export const openVim = ( inputFn, textField, addNewLine, focusP, setTextField, commandHandler, bindEvents, consoleKeydown, onExit ) => {
  const input = inputFn();
  savedState.input = input.cloneNode( true );
  savedState.textField = textField.cloneNode( true );
  savedState.m = qs( '#m' ).cloneNode( true );

  qs( '#m' ).innerHTML = '';
  qs( '#m' ).appendChild( input );
  const p = document.createElement( 'p' );
  textField.innerHTML = '';
  input.value = '';
  p.appendChild( textField );
  p.classList.add( 'current' );
  qs( '#m' ).appendChild( p );

  const msg = `# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
# On branch master
# Changes to be committed:
# &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;modified:   index.html
# &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;modified:   ./sass/source/responsive.js
#`;

  msg.split( '\n' ).forEach( ( line ) => {
    addNewLine( { text: line } );
  } );

  const pWidth = qs( 'p' ).clientHeight;
  for ( let x = 0; x < ( qs( '#m' ).clientHeight - 12 - pWidth * ( msg.split( '\n' ).length + 2 ) ) / pWidth; x++ ) {
    addNewLine( { dir: '~', disabled: true, className: 'vim-tilde' } );
  }

  const insertSign = addNewLine( { dir: '', disabled: true, className: 'insert' } );
  const commandLine = addNewLine( { dir: '', disabled: true, className: 'vim-command-line' } );

  insertSign.parentNode.classList.add( 'show' );

  input.focus();
  input.removeEventListener( 'keydown', consoleKeydown );
  data = { inputFn, textField, addNewLine, focusP, setTextField, commandHandler, bindEvents, onExit, commandLine, insertSign };
  input.addEventListener( 'keydown', changeCurrent );
};

const exitVim = ( status ) => {
  const commitMsg = qs( '#m p:first-of-type span' ).innerHTML;

  qs( '#m' ).parentNode.removeChild( qs( '#m' ) );
  document.body.appendChild( savedState.m );

  data.setTextField( data.addNewLine( { dir: true } ) );
  data.focusP();

  data.inputFn().value = '';
  data.bindEvents();
  data.inputFn().focus();

  let postCommit;
  if ( status ) {
    postCommit = `[master (root-commit) 06b7dc0] ${ commitMsg }
    2 files changed, 2 insertions(+), 2 deletions(-)`;
  } else {
    postCommit = 'Aborting commit due to empty commit message.';
  }

  data.commandHandler( `echo ${ postCommit }` );
  data.onExit( status );
};

const changeCurrent = ( e ) => {
  if ( disableInput ) {
    e.preventDefault();
  }

  if ( e.key === 'Enter' && isCommandLineActive && EXITING_VIM_COMBINATIONS.find( _ => _ === data.commandLine.innerText ) ) {
    const commitMsg = qs( '#m p:first-of-type span' ).innerHTML;
    data.inputFn().value = '';
    exitVim( data.commandLine.innerText === 'wq' && commitMsg.trim() !== '' );
  } else if ( e.key === 'Enter' && isCommandLineActive && !EXITING_VIM_COMBINATIONS.find( _ => _ === data.commandLine.innerText ) && !data.commandLine.parentNode.classList.contains( 'error' ) ) {
    data.commandLine.innerText = `E492: Not an editor command: ${ data.commandLine.innerText }`;
    data.commandLine.parentNode.classList.add( 'error' );
  } else if ( e.keyCode === 40 || e.keyCode === 38 ) {
    e.preventDefault();
    const { textField } = data;

    const p = textField.parentNode;
    let next;

    if ( e.keyCode === 40 ) {
      next = p.nextSibling;
    } else if ( e.keyCode === 38 ) {
      next = p.previousSibling;
    }

    if ( next && next.tagName === 'P' && !next.classList.contains( 'disabled' ) ) {
      p.classList.remove( 'current' );
      next.classList.add( 'current' );

      const text = next.innerText;
      const span = next.querySelector( 'span' );

      data.inputFn().value = text.substring( text.length - span.innerText.length - 1 );
      data.inputFn().focus();

      data.textField = span;
      data.setTextField( span );
    }

    data.commandLine.parentNode.classList.remove( 'error' );
    data.commandLine.innerText = data.inputFn().value;
  } else {
    data.commandLine.parentNode.classList.remove( 'error' );
    data.commandLine.innerText = data.inputFn().value;
  }

  if ( e.key === 'i' && !isCommandLineActive ) {
    data.commandLine.innerText = '';
    const firstSpan = document.querySelector( 'p span' );
    data.inputFn().value = firstSpan.innerText;
    e.preventDefault();
    data.textField = firstSpan;
    data.setTextField( firstSpan );
    firstSpan.parentNode.classList.add( 'current' );
    data.commandLine.parentNode.classList.remove( 'current' );
    isInputModeOn = true;
    isCommandLineActive = false;
    data.insertSign.parentNode.classList.add( 'show' );
    disableInput = false;

    return;
  }

  if ( e.key === 'Escape' || ( e.key === 'c' && e.ctrlKey ) ) {
    isInputModeOn = false;
    isCommandLineActive = false;
    data.insertSign.parentNode.classList.remove( 'show' );
    data.commandLine.parentNode.classList.remove( 'show' );
    data.commandLine.parentNode.classList.remove( 'current' );
    if ( qs( '.current' ) ) {
      qs( '.current' ).classList.remove( 'current' );
    }
    data.inputFn().value = '';
    data.commandLine.innerText = '';
    disableInput = true;
    return;
  }

  if ( !isInputModeOn && e.key === ':' && !isCommandLineActive ) {
    disableInput = false;
    data.inputFn().value = '';
    e.preventDefault();
    data.commandLine.parentNode.classList.add( 'disabled' );
    data.commandLine.parentNode.classList.add( 'show' );
    if ( qs( '.current' ) ) {
      qs( '.current' ).classList.remove( 'current' );
    }
    data.commandLine.parentNode.classList.add( 'current' );

    data.textField = data.commandLine;
    data.setTextField( data.commandLine );
    isCommandLineActive = true;
  }
};
