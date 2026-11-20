# Vijes Digital Links enquiry system — setup

This backend uses Google Apps Script, Google Sheets and Gmail.

## What it does
- Receives website enquiries server-side.
- Saves each enquiry in a private Google Sheet.
- Emails a notification to vijesdigitallinks@gmail.com.
- Records the visitor's name, organisation, email, phone/WhatsApp, website or social profile, selected service, preferred timeframe, contact method and project details.
- Records marketing consent separately; it does not automatically subscribe the visitor or send bulk marketing.
- Includes basic validation, a hidden bot-trap field, formula-injection protection and short-window duplicate protection.

## Updating the existing live enquiry system
The website form has already been tested successfully: a test submission was accepted and the notification arrived at the Vijes inbox. Keep the existing Apps Script Web App URL in the website code; replacing it with a new deployment URL is not necessary when updating the current deployment.

1. Sign in to the business Google account that owns the current "Vijes Website Enquiries" Apps Script project and private spreadsheet.
2. Open the existing project at https://script.google.com/ and replace the editor contents with the latest `google-apps-script/Code.gs` from this repository.
3. Save the project. From the function selector, run `initialiseVijesEnquirySystem`. The updated function adds the four new optional-field headers to the existing sheet without moving or overwriting previous enquiry rows.
4. Open Deploy → Manage deployments. Edit the existing Web App deployment, choose **New version**, and deploy it. Keep "Execute as" set to your account and access set to "Anyone" so website visitors can submit without signing in.
5. Do not create a new deployment unless you also update the website's endpoint. Keep the spreadsheet private and do not share its edit link with visitors.
6. Submit a new test enquiry containing a phone number, website URL, timeframe and preferred contact method. Confirm that the notification email and private spreadsheet both contain those values.
7. Do not put a Google password, API key or spreadsheet edit link in the public website code.

## Important privacy and marketing safeguards
- The marketing checkbox must be optional and unchecked by default.
- Enquiry processing consent and marketing consent must be separate.
- Only records with Marketing consent = Yes may be considered for a marketing audience.
- Do not send bulk marketing until a managed unsubscribe route and suppression list are implemented and tested.
- Limit spreadsheet access to the business owner and authorised staff who need it. Enable Google account two-step verification.
- Set a retention period and periodically delete enquiries no longer needed, subject to legal/business obligations.
- Do not collect passwords, payment-card details, government IDs or sensitive personal information through this form.
- Review the privacy notice and applicable data-protection requirements before launch.

## Deployment status
The live website form is connected to a deployed Apps Script Web App and the owner has confirmed a test notification arrived by email. The optional-field capture update in this repository is a source-code change only until it is copied into the existing Apps Script project and deployed as a new version. Re-test both the inbox email and private spreadsheet after that deployment.
