import {Option} from '../option';

export let FIREBASE = 'firebase';
export let FIREBASE_PATH = 'firebase-path';

export let options = {
  firebase : new Option(FIREBASE, 'boolean', 'use firebase storage', false),
  firebasePath : new Option(FIREBASE_PATH, 'string',
                            'firebase path (example: "/hosts")', '/')
};
