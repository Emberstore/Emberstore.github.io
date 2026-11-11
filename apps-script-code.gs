// Ember Store — order tracker
// Stores every website order in a Google Sheet and reports how many
// orders arrived TODAY (Pakistan time). The count resets every day
// because it is always counted fresh from today's date.

var SHEET_NAME = 'Orders';
var TIMEZONE = 'Asia/Karachi';

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Time', 'Name', 'Plan', 'Price', 'Email', 'Referral', 'WhatsApp sent to']);
  }
  return sheet;
}

// Called automatically by the website every time an order is placed.
function doPost(e) {
  var data = {};
  try { data = JSON.parse(e.postData.contents); } catch (err) {}
  var sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    data.name || '',
    data.plan || '',
    data.price || '',
    data.email || '',
    data.referral || '',
    data.whatsapp || ''
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Returns ONLY today's order count, e.g. {"date":"2026-11-11","orders_today":3}
// No customer details are ever returned here.
function doGet(e) {
  var sheet = getSheet_();
  var today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
  var values = sheet.getDataRange().getValues();
  var count = 0;
  for (var i = 1; i < values.length; i++) {
    if (!values[i][0]) continue;
    var day = Utilities.formatDate(new Date(values[i][0]), TIMEZONE, 'yyyy-MM-dd');
    if (day === today) count++;
  }
  return ContentService
    .createTextOutput(JSON.stringify({ date: today, orders_today: count }))
    .setMimeType(ContentService.MimeType.JSON);
}
