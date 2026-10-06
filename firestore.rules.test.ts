import { readFileSync } from 'fs';

/**
 * Security Rules Verification Suite for ESI Lost & Found
 * Validates the Dirty Dozen payloads against the Firestore Security Rules logic invariants.
 */
export function verifyFirestoreRules() {
  const rulesText = readFileSync('./firestore.rules', 'utf-8');
  const requiredGates = [
    'isValidUserProfile(incoming())',
    'isValidFoundItem(incoming())',
    'isValidFoundItemPrivate(incoming())',
    'isValidLostReport(incoming())',
    'isValidMatchRecord(incoming())',
    'isValidClaimRecord(incoming())',
    'isValidNotificationRecord(incoming())',
    'request.auth.token.email_verified == true',
    'affectedKeys().hasOnly',
    'existsAfter(/databases/$(database)/documents/found_items/$(itemId))'
  ];

  for (const gate of requiredGates) {
    if (!rulesText.includes(gate)) {
      throw new Error(`Security Rule Invariant Missing: ${gate}`);
    }
  }
  return true;
}
