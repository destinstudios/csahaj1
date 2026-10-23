window.SAHAJ_CONFIG = {
  whatsappNumber: "919648909066",
  phoneNumber: "9648909066",
  address: "Lihai, Dhata-Khaga Road, Dhata, Fatehpur, Uttar Pradesh 212641",
  mapsUrl: "https://maps.app.goo.gl/ABQ8n3E2XBSCsh1X6",
  adminEmails: [
    "shauryasahaj@gmail.com",
    "adityasinghzrx@gmail.com"
  ],
  firebase: {
  apiKey: "AIzaSyCSLRivs-ZXOTWMStgfmP1xAdRXDSFzUwk",
  authDomain: "chandan-sahaj.firebaseapp.com",
  databaseURL: "https://chandan-sahaj-default-rtdb.firebaseio.com",
  projectId: "chandan-sahaj",
  storageBucket: "chandan-sahaj.firebasestorage.app",
  messagingSenderId: "599153312755",
  appId: "1:599153312755:web:ddebf125c39a9494314886"
}
};
window.SAHAJ_FIREBASE_READY = Boolean(
  window.SAHAJ_CONFIG.firebase.apiKey &&
  !window.SAHAJ_CONFIG.firebase.apiKey.startsWith("PASTE_") &&
  window.SAHAJ_CONFIG.firebase.projectId &&
  !window.SAHAJ_CONFIG.firebase.projectId.startsWith("PASTE_") &&
  window.SAHAJ_CONFIG.firebase.appId &&
  !window.SAHAJ_CONFIG.firebase.appId.startsWith("PASTE_")
);
