import { qs } from './utils';
const savedState = {};
let data = {};

let isInputModeOn = false;
let isCommandLineActive = false;

const EXITING_VIM_COMBINATIONS = [
  {
    'Escape': false,
    ':': false,
    'q': false,
    combinationString: 'wq',
  },
  {
    'Escape': false,
    ':': false,
    'w': false,
    'q': false,
    combinationString: 'q',
  },
  {
    'Escape': false,
    ':': false,
    'q': false,
    '!': false,
    combinationString: 'q!',
  },
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
  #
  # Initial commit
  #
  # Changes to be committed:
  #       new file:   i.txt
  #`;

  msg.split( '\n' ).forEach( ( line ) => {
    addNewLine( { text: line } );
  } );

  addNewLine( { dir: '~', disabled: true, className: 'vim-tilde' } );
  addNewLine( { dir: '~', disabled: true, className: 'vim-tilde' } );
  const insertSign = addNewLine( { dir: '', disabled: true, className: 'insert' } );
  const commandLine = addNewLine( { dir: '', disabled: true, className: 'vim-command-line' } );


  input.focus();
  input.removeEventListener( 'keydown', consoleKeydown );
  data = { inputFn, textField, addNewLine, focusP, setTextField, commandHandler, bindEvents, onExit, commandLine, insertSign };
  input.addEventListener( 'keydown', changeCurrent );
};

const exitVim = () => {
  qs( '#m' ).parentNode.removeChild( qs( '#m' ) );
  document.body.appendChild( savedState.m );

  data.setTextField( data.addNewLine( { dir: true } ) );
  data.focusP();

  data.inputFn().value = '';
  data.bindEvents();
  data.inputFn().focus();

  const postCommit = `[master (root-commit) c063583] Commit
  1 file changed, 1 insertion(+)
  create mode 100644 i.txt`;

  data.commandHandler( `echo ${ postCommit }` );
  data.onExit();
};

window.exitVim = exitVim;

const changeCurrent = ( e ) => {
  console.log( e );
  if ( e.keyCode === 67 && e.ctrlKey ) {
    exitVim();
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

    if ( next.tagName === 'P' && !next.classList.contains( 'disabled' ) ) {
      p.classList.remove( 'current' );
      next.classList.add( 'current' );

      const text = next.innerText;
      const span = next.querySelector( 'span' );

      data.inputFn().value = text.substring( text.length - span.innerText.length - 1 );
      data.inputFn().focus();

      data.textField = span;
      data.setTextField( span );
    }
  }

  if ( e.key === 'i' && !isCommandLineActive ) {
    data.commandLine.innerText = '';
    const firstSpan = document.querySelector( 'p span' );
    data.inputFn().value = firstSpan.innerText;
    e.preventDefault();
    data.textField = document.querySelector( 'p span' );
    data.setTextField( document.querySelector( 'p span' ) );
    isInputModeOn = true;
    isCommandLineActive = false;
    return;
  }

  if ( e.key === 'Escape' ) {
    isInputModeOn = false;
    isCommandLineActive = false;
    return;
  }

  if ( !isInputModeOn && e.key === ':' && !isCommandLineActive ) {
    data.inputFn().value = '';
    data.commandLine.focus();
    document.querySelector( '.current' ).classList.remove( 'current' );
    data.commandLine.classList.add( 'current' );
    data.commandLine.removeAttribute( 'disabled' );
    data.textField = data.commandLine;
    data.setTextField( data.commandLine );
    isCommandLineActive = true;
  }
};
