importScripts('https://www.gstatic.com/firebasejs/8.6.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.6.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyBYGCbdr-FSDMtB_-PvDKf7OIJuo1-a5nE",
  authDomain: "sportmach-fc07f.firebaseapp.com",
  projectId: "sportmach-fc07f",
  storageBucket: "sportmach-fc07f.appspot.com",
  messagingSenderId: "276809292205",
  appId: "1:276809292205:web:fcef7335a06702d4496924"
});

const messaging = firebase.messaging();
