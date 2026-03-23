const admin = require('firebase-admin');

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;