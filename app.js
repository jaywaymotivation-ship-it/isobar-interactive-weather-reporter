const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const statusEl = document.getElementById('status');
const locationNameEl = document.getElementById('locationName');
const weatherIconEl = document.getElementById('weatherIcon');
const temperatureEl = document.getElementById('temperature');
const summaryEl = document.getElementById('summary');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const narrativeEl = document.getElementById('narrative');
const forecastEl = document.getElementById('forecast');

const defaultLocation = 'London';

const weatherCodeMap = {
  0: { label: 'Clear sky', icon: '☀️' },
  1: { label: 'Mostly clear', icon: '🌤️' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Foggy', icon: '🌫️' },
  48: { label: 'Foggy', icon: '🌫️' },
  51: { label: 'Light drizzle', icon: '🌦️' },
  53: { label: 'Drizzle', icon: '🌦️' },
  55: { label: 'Heavy drizzle', icon: '🌧️' },
  56: { label: 'Freezing drizzle', icon: '🌧️' },
  57: { label: 'Freezing drizzle', icon: '🌧️' },
  61: { label: 'Light rain', icon: '🌦️' },
  63: { label: 'Rain', icon: '🌧️' },
  65: { label: 'Heavy rain', icon: '🌧️' },
  66: { label: 'Freezing rain', icon: '🌧️' },
  67: { label: 'Heavy freezing rain', icon: '🌧️' },
  71: { label: 'Light snow', icon: '🌨️' },
  73: { label: 'Snow', icon: '❄️' },
  75: { label: 'Heavy snow', icon: '❄️' },
  77: { label: 'Snow grains', icon: '❄️' },
  80: { label: 'Rain showers', icon: '🌦️' },
  81: { label: 'Moderate showers', icon: '🌧️' },
  82: { label: 'Heavy showers', icon: '🌧️' },
  85: { label: 'Snow showers', icon: '🌨️' },
  86: { label: 'Heavy snow showers', icon: '🌨️' },
  95: { label: 'Thunderstorm', icon: '⛈️' },
  96: { label: 'Thunderstorm with hail', icon: '⛈️' },
  99: { label: 'Severe thunderstorm', icon: '⛈️' }
};

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', isError);
}

function formatDay(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function getWeatherSummary(code, temperature) {
  const current = weatherCodeMap[code] || { label: 'Conditions', icon: '🌤️' };
  if (temperature >= 30) return `${current.label} and very warm.`;
  if (temperature >= 20) return `${current.label} with mild conditions.`;
  if (temperature >= 10) return `${current.label} and pleasantly cool.`;
  if (temperature >= 0) return `${current.label} with a brisk chill.`;
  return `${current.label} and cold.`;
}

function renderForecast(days, codeList) {
  forecastEl.innerHTML = '';

  days.forEach((day, index) => {
    const code = codeList[index] ?? 0;
    const info = weatherCodeMap[code] || weatherCodeMap[0];
    const card = document.createElement('article');
    card.className = 'day-card';

    const dayName = document.createElement('div');
    dayName.className = 'day-name';
    dayName.textContent = formatDay(day.date);

    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.textContent = info.icon;

    const range = document.createElement('div');
    range.className = 'range';
    range.textContent = `${Math.round(day.tempMin)}° / ${Math.round(day.tempMax)}°`;

    card.append(dayName, icon, range);
    forecastEl.append(card);
  });
}

function renderWeather(data) {
  const current = data.current;
  const daily = data.daily;
  const code = current.weather_code;
  const weatherInfo = weatherCodeMap[code] || weatherCodeMap[0];

  locationNameEl.textContent = `${data.location.name}, ${data.location.country}`;
  weatherIconEl.textContent = weatherInfo.icon;
  temperatureEl.textContent = `${Math.round(current.temperature_2m)}°C`;
  summaryEl.textContent = getWeatherSummary(code, current.temperature_2m);
  feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;
  humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  windEl.textContent = `${Math.round(current.wind_speed_10m)} km/h`;

  const narrativeText = `Right now, ${data.location.name} is ${weatherInfo.label.toLowerCase()} with a temperature of ${Math.round(current.temperature_2m)}°C. It feels like ${Math.round(current.apparent_temperature)}°C, with ${Math.round(current.relative_humidity_2m)}% humidity and winds around ${Math.round(current.wind_speed_10m)} km/h. The nearby forecast suggests ${getWeatherSummary(code, current.temperature_2m).toLowerCase()}`;
  narrativeEl.textContent = narrativeText;

  renderForecast(
    daily.map((entry) => ({
      date: entry.date,
      tempMin: entry.temperature_2m_min,
      tempMax: entry.temperature_2m_max
    })),
    daily.map((entry) => entry.weather_code)
  );
}

async function lookupCity(query) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  );

  if (!response.ok) {
    throw new Error('Unable to find that location right now.');
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error('No matching city was found. Try a larger city or a different spelling.');
  }

  const place = data.results[0];
  return {
    name: place.name,
    country: place.country || place.admin1 || 'Unknown region',
    latitude: place.latitude,
    longitude: place.longitude
  };
}

async function fetchWeatherForCity(city) {
  const place = await lookupCity(city);

  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=5&timezone=auto`
  );

  if (!weatherResponse.ok) {
    throw new Error('Weather data could not be loaded.');
  }

  const payload = await weatherResponse.json();

  return {
    location: {
      name: place.name,
      country: place.country
    },
    current: payload.current,
    daily: payload.daily.time.map((date, index) => ({
      date,
      weather_code: payload.daily.weather_code[index],
      temperature_2m_min: payload.daily.temperature_2m_min[index],
      temperature_2m_max: payload.daily.temperature_2m_max[index]
    }))
  };
}

async function loadWeatherForInput() {
  const city = cityInput.value.trim() || defaultLocation;

  setStatus('Gathering weather data...');

  try {
    const data = await fetchWeatherForCity(city);
    renderWeather(data);
    setStatus(`Updated for ${data.location.name}.`);
  } catch (error) {
    setStatus(error.message || 'Something went wrong while fetching the weather.', true);
  }
}

searchButton.addEventListener('click', loadWeatherForInput);
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadWeatherForInput();
  }
});

loadWeatherForInput();
