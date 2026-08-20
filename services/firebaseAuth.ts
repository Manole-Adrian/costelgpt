import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { environment } from '../config/env.ts';
import { ALLOWED_EMAIL_DOMAIN } from './constants.ts';

// Cloud Functions provides credentials ambiently; locally the project id is
// all verifyIdToken needs, since it validates against Google's public keys.
if (getApps().length === 0) {
  initializeApp({ projectId: environment.firebaseProjectId });
}

export type VerifiedUser = {
  uid: string,
  email: string,
  emailVerified: boolean,
}

/**
 * Verifies a Firebase ID token's signature, expiry and audience.
 * Throws if the token is missing, malformed, expired or forged.
 */
export async function verifyRequestToken(authHeader: string): Promise<VerifiedUser> {
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length).trim()
    : authHeader.trim();

  if (!token) {
    throw new Error('Authorization header did not contain a token');
  }

  const decoded = await getAuth().verifyIdToken(token);

  return {
    uid: decoded.uid,
    email: decoded.email ?? '',
    emailVerified: decoded.email_verified === true,
  };
}

export function isAllowedUser(user: VerifiedUser) {
  return user.emailVerified && user.email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN);
}
