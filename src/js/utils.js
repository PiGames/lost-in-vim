export let doc = document;

export const setDoc = ( newDoc ) => {
  doc = newDoc;
};

export const qs = ( el ) => doc.querySelector( el );
