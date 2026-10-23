# Chandan Sahaj JanSeva Kendra — repaired project

Static multi-page website with Firebase Google Sign-In, multi-admin authorization, Firestore service management, and public Firestore-backed service listings.

## Important: complete Firebase setup before deployment

1. Open `js/config.js` and paste the **complete Firebase Web App config** from Firebase Console → Project settings → Your apps. The package intentionally contains placeholders because the full API key was not present in the supplied config file.
2. Replace `SECOND_ADMIN_EMAIL@gmail.com` with the actual second admin email in **both** `js/config.js` and `firestore.rules`. Keep the same spelling in both places. The first admin email is already listed.
3. Firebase Console → Authentication → Sign-in method → enable **Google**.
4. Firebase Console → Authentication → Settings → Authorized domains → add the deployed host domain (for GitHub Pages, `destinstudios.github.io`; for Vercel, your actual deployment domain).
5. Create/enable Firestore, then publish the contents of `firestore.rules` from Firebase Console. These rules cover only the `services` collection. If your existing project has other collections with rules, preserve and merge their rules rather than replacing them blindly.
6. Deploy the contents of this folder to the **same** hosting project that serves the live site. For GitHub Pages, commit and push the changed files; for Vercel, redeploy the same project.

## Files
- `index.html`, `services.html`, `about.html`, `contact.html`: public pages
- `admin.html`: Google sign-in and service dashboard
- `js/config.js`: contact info, admin allowlist and Firebase web config
- `js/admin.js`: Google authentication and service CRUD
- `js/public-services.js`: shared Firestore read helper and offline starter examples
- `js/home.js`, `js/services.js`: Firestore-backed public service cards/list/search
- `firestore.rules`: secure service collection permissions

## Data safety

This code does **not** delete, reset, migrate or seed Firestore data automatically. Existing `services` documents remain untouched. When the collection is empty, the admin dashboard shows an empty state; add services explicitly through the dashboard. When Firebase config is incomplete, public pages show starter examples only; these examples are not written to Firestore.

## Verify after deployment

- Test Google sign-in with each listed admin account.
- Test an unlisted Google account; it must be denied.
- Add a test service, publish it, and check it on the Home and Services pages in another browser/device.
- Hide the test service and verify it disappears publicly; delete only after confirming you no longer need it.
- Check browser Console if Google login fails. The admin page now shows specific Firebase auth errors where possible.

## Notes

- Google accounts should normally return a verified email to Firebase, but the code still checks `emailVerified`; Firestore rules also enforce verified email.
- Do not place Firebase service-account private keys or passwords in client files.
- This is an independent service centre website, not an official government portal. Only advertise services the centre is authorized to provide. Do not ask customers to send OTPs, passwords, Aadhaar details or other sensitive information through WhatsApp.
