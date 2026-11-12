# Vijes Digital Links enquiry system — setup

This backend uses Google Apps Script, Google Sheets and Gmail.

## What it does
- Receives website enquiries server-side.
- Saves each enquiry in a private Google Sheet.
- Emails a notification to vijesdigitallinks@gmail.com.
- Records whether the visitor separately opted into marketing updates.
- Sends a short confirmation of the marketing preference only when consent is given.
- Includes basic validation, a hidden bot-trap field and short-window duplicate protection.

## Setup (business Google account)
1. Sign in to the Google account that should own the enquiry spreadsheet and send website notifications.
2. Open https://script.google.com/ and create a new project named "Vijes Website Enquiries".
3. Replace the default editor content with the complete contents of `google-apps-script/Code.gs`.
4. Save. From the function selector choose `initialiseVijesEnquirySystem`, then click Run and approve the requested Google Sheets and email permissions.
5. Open the execution log. It prints the private spreadsheet URL. Keep that spreadsheet private; do not publish it or share it publicly.
6. Choose Deploy → New deployment → Web app.
7. Set "Execute as" to your account. Set access to "Anyone" so website visitors can submit without signing in. Deploy and copy the Web App URL ending in `/exec`.
8. Do not post the deployment URL in public comments or share the spreadsheet with visitors. The endpoint is public by design; the spreadsheet remains private.
9. The website form must be configured with that exact Web App URL before it can submit live enquiries. Do not put any Google password, API key or spreadsheet edit link in website code.

## Important privacy and marketing safeguards
- The marketing checkbox must be optional and unchecked by default.
- Enquiry processing consent and marketing consent must be separate.
- Only records with Marketing consent = Yes may be added to a marketing audience.
- Every marketing email must identify Vijes Digital Links and provide a working unsubscribe route. The initial implementation supports replying "Unsubscribe"; a production campaign sender should maintain a suppression list and automatically honour opt-outs before any bulk sends.
- Limit spreadsheet access to the business owner and authorised staff who need it. Enable Google account two-step verification.
- Set a retention period and periodically delete enquiries no longer needed, subject to legal/business obligations.
- Do not collect passwords, payment-card details, government IDs or sensitive personal information through this form.
- Review the privacy notice and applicable data-protection requirements before launch.

## Deployment status
This repository file is the backend source only. The live website form is not connected until the Web App is deployed and its URL is added to the website configuration. A test submission and confirmation of both the spreadsheet row and inbox email are required before announcing the feature as live.
