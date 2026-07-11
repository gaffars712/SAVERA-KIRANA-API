/**
 * Firebase Admin SDK wrapper.
 *
 * Env var:
 *   FIREBASE_SERVICE_ACCOUNT_B64   base64-encoded service-account JSON
 *
 * Get the service account JSON from:
 *   Firebase Console → Project Settings → Service accounts → "Generate new private key"
 * Then in your shell:
 *   base64 -i savera-kirana-firebase.json   (mac/linux)
 *   or use PowerShell/online base64 tool on Windows
 *
 * Deploy: paste the resulting string into FIREBASE_SERVICE_ACCOUNT_B64 on Render.
 */
const config = require('../config/config');
const logger = require('../config/logger');

let admin = null;
let initialised = false;

const init = () => {
  if (initialised) return admin;
  if (!config.firebase.serviceAccountB64) {
    logger.warn('Firebase Admin not configured (FIREBASE_SERVICE_ACCOUNT_B64 empty)');
    initialised = true;
    return null;
  }
  try {
    // eslint-disable-next-line global-require
    admin = require('firebase-admin');
    const json = JSON.parse(
      Buffer.from(config.firebase.serviceAccountB64, 'base64').toString('utf8')
    );
    admin.initializeApp({
      credential: admin.credential.cert(json),
    });
    logger.info('Firebase Admin initialised for project ' + json.project_id);
  } catch (e) {
    logger.error('Firebase Admin init failed: ' + e.message);
    admin = null;
  }
  initialised = true;
  return admin;
};

const isConfigured = () => !!init();

/**
 * Verify a Firebase ID token from the customer web/mobile client.
 * Returns { phone_number, uid, ... } on success.
 */
const verifyIdToken = async (idToken) => {
  const a = init();
  if (!a) throw new Error('Firebase Admin not configured');
  return a.auth().verifyIdToken(idToken);
};

module.exports = { verifyIdToken, isConfigured };
