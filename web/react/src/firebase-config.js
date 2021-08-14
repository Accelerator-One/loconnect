// Firebase Dependencies
import firebase from "firebase/app";

import "firebase/auth";
import "firebase/functions";

// Firebase Config
const firebaseConfig = {
  // Your firebase-config HERE
};

firebase.initializeApp(firebaseConfig);

export default firebase;
export const functions = firebase.app().functions("YOUR_REGION_HERE");
