const admin = require('firebase-admin');

if (process.env.GOOGLE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT:", error);
    }
} else {
    console.warn("GOOGLE_SERVICE_ACCOUNT not set. Firebase Admin not initialized.");
}

module.exports = admin;