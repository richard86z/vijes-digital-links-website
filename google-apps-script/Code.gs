/**
 * Vijes Digital Links — website enquiry backend
 * Deploy as a Google Apps Script Web App:
 * Execute as: Me
 * Who has access: Anyone
 *
 * On first run, initialiseVijesEnquirySystem() creates a private Google Sheet
 * and stores its ID in Script Properties. The public web app accepts only
 * enquiry submissions; it never exposes sheet-reading functions.
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
  try {
    const p = (e && e.parameter) ? e.parameter : {};
    // Honeypot field: bots commonly fill hidden fields.
    if (String(p.website || '').trim()) return json_({ ok: true });

    const name = clean_(p.name, CONFIG.MAX_NAME);
    const organisation = clean_(p.organisation, CONFIG.MAX_ORG);
    const email = clean_(p.email, CONFIG.MAX_EMAIL).toLowerCase();
    const service = clean_(p.service, 100);
    const details = clean_(p.details, CONFIG.MAX_DETAILS);
    const consent = String(p.marketingConsent || '') === 'yes';

    if (!name || !email || !service || !details) return json_({ ok: false, error: 'Please complete all required fields.' });
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return json_({ ok: false, error: 'Please enter a valid email address.' });
    if (CONFIG.ALLOWED_SERVICES.indexOf(service) === -1) return json_({ ok: false, error: 'Invalid service selection.' });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const cache = CacheService.getScriptCache();
      const key = 'submission_' + Utilities.base64EncodeWebSafe(
        Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, email + '|' + details)
      );
      if (cache.get(key)) return json_({ ok: false, error: 'This enquiry was already received recently.' });
      cache.put(key, '1', 60);
      
      const sheetId = PropertiesService.getScriptProperties().getProperty('VIJES_SHEET_ID');
      if (!sheetId) throw new Error('Enquiry system has not been initialised.');
      const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Enquiries');
      const now = new Date();
      sheet.appendRow([now, name, organisation, email, service, details, consent ? 'Yes' : 'No', consent ? now : '', 'New']);

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
      ].join('\\n');
      MailApp.sendEmail(CONFIG.INBOX, subject, body, { replyTo: email, name: 'Vijes Digital Links Website' });

      if (consent) {
        const welcome = 'Thank you for choosing to receive updates from Vijes Digital Links. We may send occasional service news, useful marketing insights and company updates. You can unsubscribe at any time by replying to an email with “Unsubscribe”.';
        MailApp.sendEmail(email, 'Your Vijes Digital Links updates preference', welcome, { name: 'Vijes Digital Links' });
      }
      return json_({ ok: true });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'We could not submit your enquiry just now. Please try again later or email vijesdigitallinks@gmail.com.' });
  }
}

function clean_(value, max) {
  return String(value || '').replace(/[<>]/g, '').trim().slice(0, max);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
