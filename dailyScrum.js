const EMAIL = '***';
const WORKSPACE_ID = 123456789;
const TOGGL_API_KEY = '***';

const SLACK_CHANNEL = '***';
const SLACK_BOT_TOKEN = '***';
const TODOIST_TOKEN = '***';

const _isHoliday = (date) => {
  const calJa = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com');
  return (date.getDay() == 0 || date.getDay() == 6 || calJa.getEventsForDay(date).length > 0);
}
const [ date, yesterdayDate ] = [ new Date(), new Date() ];
yesterdayDate.setDate(yesterdayDate.getDate() - 1);
while (_isHoliday(yesterdayDate)) yesterdayDate.setDate(yesterdayDate.getDate() - 1);
const today = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd');
const yesterday = Utilities.formatDate(yesterdayDate, 'Asia/Tokyo', 'yyyy-MM-dd');

const dailyScrum = () => {
  if (!_isHoliday(date) && date.getDay() != 3 && !_postTasks()) _postTasks();
}

const _postTasks = () => {
  const slackHistory = JSON.parse(UrlFetchApp.fetch(
    `https://slack.com/api/conversations.history?token=${SLACK_BOT_TOKEN}&channel=${SLACK_CHANNEL}&limit=50`,
    {
      method: 'get',
      contentType: 'application/json',
    }
  ).getContentText()).messages;
  let chatDate, threadTs;
  slackHistory.map((row) => {
    chatDate = new Date(row.text);
    if (chatDate != 'Invalid Date' && today === Utilities.formatDate(chatDate, 'Asia/Tokyo', 'yyyy-MM-dd')) {
      Logger.log(row.text);
      threadTs = row.ts;
    }
  });
  _sendToSlack(threadTs);
  return threadTs;
}

const _sendToSlack = (thread_ts) => {
  const data = {
    channel: SLACK_CHANNEL,
    token: SLACK_BOT_TOKEN,
    text: today,
  };
  if (thread_ts) {
    data.thread_ts = thread_ts;
    data.text = _createReport();
  }
  const result = UrlFetchApp.fetch('https://slack.com/api/chat.postMessage', {
    method: 'post',
    payload: data,
  });
  Logger.log(result);
}

const _createReport = () => {
  const yesterdayTask = _getYesterdayTask();
  let report = `${yesterday}\n`;
  for (let [projectName, tasks] of Object.entries(yesterdayTask)) {
    report += `${projectName}\n`;
    tasks.map((task) => {
      report += `　${task}\n`;
    })
  }
  const todayTask = _getTodayTask();
  report += `本日\n`;
  let detail = '';
  todayTask.map((row) => {
    detail = '';
    row.tasks.map((task) => {
      if (task.due && task.due.date <= today) detail += `　${task.content}\n`;
    });
    if (detail) {
      report += `${row.projectName}\n`
      report += detail
    }
  });
  return report;
}

const _getTodayTask = () => {
  const todoist = JSON.parse(UrlFetchApp.fetch(
    `https://api.todoist.com/sync/v8/sync?token=${TODOIST_TOKEN}&sync_token=*&resource_types=[%22items%22,%22sections%22]`,
    {
      method: 'get',
      contentType: 'application/json',
    }
  ).getContentText());
  return todoist.sections.map((section) => ({
    projectName: section.name,
    tasks: todoist.items.filter(item => item.section_id === section.id)
  }));
}

const _getYesterdayTask = () => {
  const toggl = _getToggleReport();
  let tasks = {};
  toggl.map((row) => {
    if (!(tasks[row.client] instanceof Array)) tasks[row.client] = [];
    tasks[row.client].push((row.description || row.project));
  });
  return tasks;
}

const _getToggleReport = () => {
  return JSON.parse(UrlFetchApp.fetch(
    `https://toggl.com/reports/api/v2/details?since=${yesterday}&until=${yesterday}&workspace_id=${WORKSPACE_ID}&user_agent=${EMAIL}`,
    {
      method: 'get',
      headers: { 'Authorization': 'Basic ' + Utilities.base64Encode(TOGGL_API_KEY + ':api_token') },
      contentType: 'application/json',
    }
  ).getContentText()).data;
}