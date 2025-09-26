# Firebase Service Account Key Issue Resolution

## Error Found:
```
com.google.auth.oauth2.GoogleAuthException: Error getting access token for service account: 400 Bad Request
POST https://oauth2.googleapis.com/token
{"error":"invalid_grant","error_description":"Invalid JWT Signature."}
```

## Root Cause:
The Firebase service account private key has an **Invalid JWT Signature**. This means:
- The service account key has been revoked/regenerated in Firebase Console
- The private key in the file is corrupted or modified
- The service account file is not the original from Firebase

## Solution:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project "steptogether-473218"  
3. Go to Settings → Project Settings → Service accounts
4. Click "Generate new private key"
5. Download the new JSON file
6. Replace the content in `src/main/resources/firebase-service-account.json`

## Alternative (if you have a valid key):
Replace the current firebase-service-account.json with a fresh copy from Firebase Console.

## Verification:
After replacing the key, run the test again:
```bash
java -cp "target/classes;target/dependency/*" com.steptogether.app.test.FirebaseConnectionTest
```

The test should show "✓ SUCCESS: Firebase connection test passed!"