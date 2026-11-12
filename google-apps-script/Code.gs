/**
 * Vijes Digital Links — website enquiry backend
 * Deploy as a Web App: Execute as Me; Who has access: Anyone.
 * The spreadsheet remains private; this endpoint accepts submissions only.
 */
const CONFIG = {
  INBOX: 'vijesdigitallinks@gmail.com',
  SHEET_NAME: 'Vijes Website Enquiries',
  MAX_NAME: 100,
  MAX_ORG: 120,
  MAX_EMAIL: 160,
  MAX_DETAILS: 2000,
  ALLOWED_SERVICES: [
    'Digital Marketing', 'Social Media Management', 'Content & Email Marketing',
    'Websites & Digital Design', 'Automation & Operations',
    'Research & Business Development', 'Translation & Interpretation',
    'Outsourcing & Project Support', 'Business or Institutional Partnership',
    'Other / Not sure yet'
  ]
};

/**
 * Browser health check. Opening the Web App URL sends a GET request.
 * This confirms the deployed script and private spreadsheet are reachable.
 */
function doGet() {
  let status = 'Deployment is responding, but the enquiry spreadsheet is not configured.';
  try {
    const id = PropertiesService.getScriptProperties().getProperty('VIJES_SHEET_ID');
    if (id) {
      const ss = SpreadsheetApp.openById(id);
      const sheet = ss.getSheetByName('Enquiries');
      status = sheet
        ? 'Vijes enquiry endpoint is online. Private enquiry spreadsheet is connected.'
        : 'Deployment is responding, but the Enquiries worksheet is missing.';
    }
  } catch (err) {
    console.error('Health check failed: ' + err);
    status = 'Deployment is responding, but the spreadsheet connection needs attention.';
  }
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">' +
    '<title>Vijes Enquiry System</title></head><body style="font:16px Arial,sans-serif;padding:32px;line-height:1.5">' +
    '<h2>Vijes Digital Links</h2><p>' + status + '</p>' +
    '<p>This page is a system health check; website enquiries are submitted separately.</p>' +
    '</body></html>'
  );
}

function initialiseVijesEnquirySystem() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('VIJES_SHEET_ID');
  let ss;
  if (id) {
    ss = SpreadsheetApp.openById(id);
  } else {
    ss = SpreadsheetApp.create(CONFIG.SHEET_NAME);
    props.setProperty('VIJES_SHEET_ID', ss.getId());
    const sheet = ss.getSheets()[0];
    sheet.setName('Enquiries');
    sheet.appendRow([
      'Received at', 'Name', 'Organisation', 'Email', 'Service',
      'Project details', 'Marketing consent', 'Consent timestamp', 'Status'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    sheet.setColumnWidth(6, 420);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm:ss');
    sheet.getRange('H:H').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  }
  Logger.log('Private enquiry spreadsheet: ' + ss.getUrl());
  return ss.getUrl();
}

function doPost(e) {
  const p = (e && e.parameter) ? e.parameter : {};
  const token = String(p.requestToken || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 100);

  try {
    // Hidden honeypot: silently discard likely bot submissions.
    if (String(p.website || '').trim()) return responsePage_({ ok: true }, token);

    const name = clean_(p.name, CONFIG.MAX_NAME);
    const organisation = clean_(p.organisation, CONFIG.MAX_ORG);
    const email = clean_(p.email, CONFIG.MAX_EMAIL).toLowerCase();
    const service = clean_(p.service, 100);
    const details = clean_(p.details, CONFIG.MAX_DETAILS);
    const consent = String(p.marketingConsent || '') === 'yes';

    if (String(p.enquiryConsent || '') !== 'yes') {
      return responsePage_({ ok: false, error: 'Please confirm that we may use your details to respond to your enquiry.' }, token);
    }
    if (!name || !email || !service || !details) {
      return responsePage_({ ok: false, error: 'Please complete all required fields.' }, token);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return responsePage_({ ok: false, error: 'Please enter a valid email address.' }, token);
    }
    if (CONFIG.ALLOWED_SERVICES.indexOf(service) === -1) {
      return responsePage_({ ok: false, error: 'Invalid service selection.' }, token);
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const cache = CacheService.getScriptCache();
      const key = 'submission_' + Utilities.base64EncodeWebSafe(
        Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email + '|' + details)
      );
      if (cache.get(key)) {
        return responsePage_({ ok: false, error: 'This enquiry was already received recently.' }, token);
      }

      const sheetId = PropertiesService.getScriptProperties().getProperty('VIJES_SHEET_ID');
      if (!sheetId) throw new Error('Enquiry system has not been initialised.');
      const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Enquiries');
      if (!sheet) throw new Error('Enquiries sheet is missing.');

      const now = new Date();
      sheet.appendRow([
        now, safeCell_(name), safeCell_(organisation), safeCell_(email),
        safeCell_(service), safeCell_(details), consent ? 'Yes' : 'No',
        consent ? now : '', 'New'
      ]);
      cache.put(key, '1', 60);

      let notificationSent = true;
      try {
        const subject = 'New website enquiry — ' + service;
        const body = [
          'A new enquiry was submitted through vijesdigitallinks.online.',
          '',
          'Name: ' + name,
          'Organisation: ' + (organisation || 'Not provided'),
          'Email: ' + email,
          'Service: ' + service,
          'Marketing updates consent: ' + (consent ? 'YES' : 'NO'),
          '',
          'Project details:',
          details,
          '',
          'The enquiry is saved in the private Vijes Website Enquiries spreadsheet.'
        ].join('\n');
        MailApp.sendEmail({
          to: CONFIG.INBOX,
          subject: subject,
          body: body,
          replyTo: email,
          name: 'Vijes Digital Links Website'
        });
      } catch (mailError) {
        notificationSent = false;
        console.error('Enquiry saved, but notification email failed: ' + mailError);
      }

      // Consent is recorded only. Do not start marketing mail until a managed
      // unsubscribe/suppression process has been put in place.
      return responsePage_({
        ok: true,
        notificationSent: notificationSent
      }, token);
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);
    return responsePage_({
      ok: false,
      error: 'We could not process your enquiry just now. Please try again later or email vijesdigitallinks@gmail.com.'
    }, token);
  }
}

function clean_(value, maxLength) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, maxLength);
}

function safeCell_(value) {
  const text = String(value == null ? '' : value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

/*
 * Apps Script ContentService responses are awkward for browser CORS.
 * Return a tiny HTML response into the website's hidden iframe and use
 * postMessage to report the result to the parent page.
 */
function responsePage_(result, token) {
  const safeToken = String(token || '').replace(/[^a-zA-Z0-9_-]/g, '');
  const payload = JSON.stringify({
    type: 'vijes-enquiry-result',
    token: safeToken,
    ok: Boolean(result.ok),
    notificationSent: Boolean(result.notificationSent),
    error: result.error || ''
  }).replace(/</g, '\\u003c');

  const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' +
    '<script>window.parent.postMessage(' + payload + ', "*");<\/script>' +
    '</body></html>';

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
