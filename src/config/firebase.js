// src/config/firebase.js
const admin = require('firebase-admin');

// Kiểm tra env FIREBASE_SERVICE_ACCOUNT_KEY
if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_KEY not found. Avatar upload will not work.');
    module.exports = null;
} else {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
    }

    const bucket = admin.storage().bucket();
    module.exports = { admin, bucket };
}