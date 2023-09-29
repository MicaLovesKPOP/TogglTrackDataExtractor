# TogglTrack Data Extractor

[![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/MicaLovesKPOP/TogglTrackDataExtractor?include_prereleases)](https://github.com/MicaLovesKPOP/TogglTrackDataExtractor/releases)
![License](https://img.shields.io/badge/license-GNU%20GPLv3-blue.svg)

Automate and simplify manual time tracking from TogglTrack to your company's timesheet software.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Local Setup](#local-setup)
  - [Configuration](#configuration)
  - [Usage](#usage)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)
- [License](#license)

## Overview

TogglTrack Data Extractor is a Node.js script designed to simplify the process of manually entering time tracking data from TogglTrack into your company's timesheet software. It fetches time entries from your TogglTrack account, processes them, and organizes them into two formats: raw and approximate. This script is particularly useful when your timesheet software lacks automated integration with TogglTrack.

## Features

- Fetches time entries from TogglTrack for the last 30 days.
- Processes time entries, rounding and adjusting durations as needed.
- Organizes time entries into raw and approximate (rounded to 0.25h) formats.
- Supports a blacklist to exclude specific entries from calculations, such as (lunch) breaks.

## Getting Started

### Local Setup

1. Install [Node.js](https://nodejs.org/en/) on your system.
2. Clone this repository or [download the latest release](https://github.com/MicaLovesKPOP/TogglTrackDataExtractor/releases/latest) and extract it.
3. Open a terminal or command prompt in the project directory and run `npm install` to install the required dependencies.

### Configuration

1. Create a `key.json` file in the project directory with your TogglTrack API token:

```json
{
  "TOGGL_API_TOKEN": "YOUR_API_TOKEN_HERE"
}
```

2. To exclude specific time entries from hours worked calculations, add keywords or phrases to the blacklist.txt file in the project directory. Each keyword or phrase should be on a separate line. Entries will be excluded from the calculation if their descriptions start with any keyword or phrase listed in the blacklist.

### Usage
1. Run `run_script.bat` to start the script.
2. The script will fetch TogglTrack time entries, process them, and generate text files in the 'timesheets/raw' and 'timesheets/approx' directories.

### Configuration

1. Sign up for an account on Your Preferred Hosting Provider.
2. Upload the script files to your hosting account.
3. Configure environment variables or settings as needed.

### Usage

1. Start the script on your hosted environment.
2. The script will execute and generate time entry files as specified.

## Contributing

Contributions to this project are welcome! Feel free to open issues or pull requests to improve the script or its documentation.

## Acknowledgements

This project may use code and resources generated with the help of external sources such as [Bing Chat](https://www.bing.com/search?q=Bing+AI&showconv=1) and [ChatGPT](https://chat.openai.com/).

## License

This project is licensed under the GNU GPLv3 License. See the [LICENSE](https://github.com/MicaLovesKPOP/TogglTrackDataExtractor/blob/main/LICENSE) file for details.

