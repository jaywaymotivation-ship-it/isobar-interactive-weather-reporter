# isobar-interactive-weather-reporter

Interactive weather reporter project.

## Overview
This project is a lightweight, browser-based weather reporter that uses the Open-Meteo API to fetch real-time weather for a city and present a compact weather summary with a short narrative.

## Features
- Search for a city
- View current temperature, feel-like temperature, humidity, and wind speed
- Read a short natural-language weather report
- See the next few days of forecast data
- Runs as a simple static web app with no build step

## Run locally
From the project root, start a local web server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Files
- `index.html` — app layout
- `style.css` — styling and theme
- `app.js` — weather fetching and rendering logic

## API notes
The app uses public APIs from Open-Meteo and does not require an API key for basic weather lookups.
