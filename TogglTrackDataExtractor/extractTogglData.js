let fetch;
const fs = require('fs');
fs.mkdirSync('timesheets/raw', { recursive: true });
fs.mkdirSync('timesheets/approx', { recursive: true });
const moment = require('moment-timezone'); // Import moment-timezone

// Read API token from keys.json
const keys = JSON.parse(fs.readFileSync('key.json', 'utf8'));
const togglApiToken = keys.TOGGL_API_TOKEN;

// Read blacklist from blacklist.txt and trim each line
const blacklist = fs.readFileSync('blacklist.txt', 'utf8').split('\n').map(line => line.trim());

// Fetch time entries from Toggl Track
async function fetchTogglTimeEntries() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const now = new Date();

  const response = await fetch.default(`https://api.track.toggl.com/api/v8/time_entries?start_date=${thirtyDaysAgo.toISOString()}&end_date=${now.toISOString()}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${togglApiToken}:api_token`).toString('base64')}`
    }
  });
  
  const timeEntries = await response.json();
  
  // Print out raw time entries
  console.log(timeEntries);
  
  return timeEntries;
}

// Helper function to format date to HH:MM
function formatTime(date) {
  return moment(date).tz('Europe/Amsterdam').format('HH:mm'); // Convert to 'Europe/Amsterdam' timezone and format to HH:mm
}

// Helper function to round time to nearest quarter hour
function roundTime(date) {
  const minutes = date.getUTCMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), roundedMinutes));
}

// Write time entries to text files
function writeTimeEntriesToFiles(timeEntries) {
  // Group time entries by date
  const groupedEntries = timeEntries.reduce((groups, entry) => {
    const date = new Date(entry.start);
    const dateString = `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
    if (!groups[dateString]) {
      groups[dateString] = [];
    }
    groups[dateString].push(entry);
    return groups;
  }, {});

  // Process each group of time entries
  for (const [date, entries] of Object.entries(groupedEntries)) {
    // Sort entries by start time
    entries.sort((a, b) => new Date(a.start) - new Date(b.start));

    let approxEntries = [];
    
    let totalRawDuration = entries.reduce((sum, entry) => sum + (blacklist.some(blacklistItem => blacklistItem === '' ? !entry.description : entry.description && (entry.description === blacklistItem || entry.description.startsWith(blacklistItem + ' ') || entry.description.startsWith(blacklistItem + ',') || entry.description.startsWith(blacklistItem + '.') || entry.description.startsWith(blacklistItem + ';') || entry.description.startsWith(blacklistItem + ':') || entry.description.startsWith(blacklistItem + '!'))) ? 0 : entry.duration / 3600), 0); // Calculate total raw duration by summing up the raw durations, excluding blacklisted entries
    let totalRoundedDuration = Math.ceil(totalRawDuration * 4) / 4; // Calculate total rounded duration by rounding up the total raw duration

    for (let i = 0; i < entries.length; i++) {
      let entry = entries[i];
      let duration = entry.duration / 3600; // Convert duration from seconds to hours

      // If the next entry exists and the combined duration of this entry and the next one is closer to a quarter hour (0.25)
      if (entries[i + 1] && Math.abs(duration + entries[i + 1].duration / 3600 - 0.25) < Math.abs(duration - 0.25)) {
        // Merge this entry with the next one
        entry = {
          start: entry.start,
          stop: entries[i + 1].stop,
          duration: entry.duration + entries[i + 1].duration,
          description: `${entry.description}, ${entries[i + 1].description}`
        };
        duration += entries[i + 1].duration / 3600;
        i++; // Skip the next entry
      }

      // Adjust this entry's duration based on its proportion of the totalRawDuration, unless it's blacklisted
      let adjustedDuration = blacklist.some(blacklistItem => blacklistItem === '' ? !entry.description : entry.description && (entry.description === blacklistItem || entry.description.startsWith(blacklistItem + ' ') || entry.description.startsWith(blacklistItem + ',') || entry.description.startsWith(blacklistItem + '.') || entry.description.startsWith(blacklistItem + ';') || entry.description.startsWith(blacklistItem + ':') || entry.description.startsWith(blacklistItem + '!'))) ? 0 : (duration / totalRawDuration) * totalRoundedDuration;

      // Adjust the stop time of this entry based on the adjustedDuration
      let stopTime = new Date(new Date(entry.start).getTime() + adjustedDuration * 60 * 60 * 1000);

      approxEntries.push({
        start: roundTime(new Date(entry.start)),
        stop: roundTime(stopTime),
        description: entry.description
      });
    }

    // Write exact time entries to text files
    const exactFileName = `timesheets/raw/${date} (raw).txt`;
    const exactFileContent = `Duration: ${totalRawDuration.toFixed(2)}\n` + entries.map(entry => `${(entry.duration / 3600).toFixed(2)}\n${formatTime(new Date(entry.start))} - ${formatTime(new Date(entry.stop))}\n${entry.description}\n\n`).join('');
    
    // Only write to file if content has changed
    if (!fs.existsSync(exactFileName) || fs.readFileSync(exactFileName, 'utf8') !== exactFileContent) {
      fs.writeFileSync(exactFileName, exactFileContent);
    }

    // Write approximate time entries to text files
    const approxFileName = `timesheets/approx/${date} (approx).txt`;
    const approxFileContent = `Duration (raw): ${totalRawDuration.toFixed(2)}\nDuration (approx): ${totalRoundedDuration.toFixed(2)}\n` + approxEntries.map(entry => `${((new Date(entry.stop).getTime() - new Date(entry.start).getTime()) / (1000 * 60 *60)).toFixed(2)}\n${formatTime(entry.start)} - ${formatTime(entry.stop)}\n${entry.description}\n\n`).join('');
    
    // Only write to file if content has changed
    if (!fs.existsSync(approxFileName) || fs.readFileSync(approxFileName, 'utf8') !== approxFileContent) {
      fs.writeFileSync(approxFileName, approxFileContent);
    }
  }
}

import('node-fetch').then(nodeFetch => {
fetch = nodeFetch;

async function main() {
   let timeEntries = await fetchTogglTimeEntries();
   writeTimeEntriesToFiles(timeEntries);
}

main();
});
