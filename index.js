// --- User Settings
const EMAIL = '***@***';
const WORKSPACE_ID = 123456;
const TOGGL_API_KEY = '*****';
const SHEET_NAME = 'Sheet name of spreadsheet (e.g. Sheet 1)';
// ---
const writeTogglReport = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const yesterday = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd');
  const togglReport = JSON.parse(UrlFetchApp.fetch(
    'https://toggl.com/reports/api/v2/details?since=' + yesterday + '&until=' + yesterday + '&workspace_id=' + WORKSPACE_ID + '&user_agent=' + EMAIL,
    {
      method:'get',
      headers: {'Authorization' : 'Basic ' + Utilities.base64Encode(TOGGL_API_KEY + ':api_token')},
      contentType: 'application/json',
    }
  ).getContentText()).data;
  const sht = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const lastRow = sht.getRange('A:A').getValues().filter(String).length;
  let nextRow;
  const color = 'Turquoise';
  togglReport.map((row, index) => {
    nextRow = lastRow + index + 1;
    sht.getRange('A' + nextRow).setBackground(color).setValue(yesterday);
    sht.getRange('C' + nextRow).setBackground(color).setValue(row.client);
    sht.getRange('D' + nextRow).setBackground(color).setValue(row.tags[0]);
    sht.getRange('E' + nextRow).setBackground(color).setValue(Math.round((row.dur / 1000 / 60 / 60) * 10) / 10);
    sht.getRange('F' + nextRow).setBackground(color).setValue(row.description);
  });
}