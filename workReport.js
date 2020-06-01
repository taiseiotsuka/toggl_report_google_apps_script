const SHEET_ID = '***';
const SHEET_NAME = '***';

const workReport = () => {
  if (!_isHoliday(date)) _writeTogglData();
}

const _writeTogglData = () => {
  const sht = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const lastRow = sht.getRange('A:A').getValues().filter(String).length;
  Logger.log('lastRow:' + lastRow);
  let nextRow;
  const color = (yesterdayDate.getDate() % 2 === 0)? 'gray' : 'turquoise';
 
  _getToggleReport().map((row, index) => {
    nextRow = lastRow + index + 1;
    sht.getRange('A' + nextRow).setBackground(color).setValue(yesterday);
    sht.getRange('C' + nextRow).setBackground(color).setValue(row.client);
    sht.getRange('D' + nextRow).setBackground(color).setValue(row.tags[0]);
    sht.getRange('E' + nextRow).setBackground(color).setValue(Math.round((row.dur / 1000 / 60 / 60) * 10) / 10);
    sht.getRange('F' + nextRow).setBackground(color).setValue((row.description || row.project));
  });
}