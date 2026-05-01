const admin = require("firebase-admin");

const getFirebasePrivateKey = () => {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  return privateKey ? privateKey.replace(/\\n/g, "\n") : undefined;
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = getFirebasePrivateKey();

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    return admin;
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });

  return admin;
};

module.exports = initializeFirebaseAdmin();
