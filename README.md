const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const useLocationButton = document.getElementById('useLocationButton');
const themeToggle = document.getElementById('themeToggle');
const statusEl = document.getElementById('status');
const locationNameEl = document.getElementById('locationName');
const weatherIconEl = document.getElementById('weatherIcon');
const temperatureEl = document.getElementById('temperature');
const summaryEl = document.getElementById('summary');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const rainChanceEl = document.getElementById('rainChance');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const narrativeEl = document.getElementById('narrative');
const forecastEl = document.getElementById('forecast');

const defaultLocation = 'London';
let currentTheme = 'dark';

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

function setTheme(theme) {
  currentTheme = theme;
  document.body.classList.toggle('theme-light', theme === 'light');
  document.body.classList.toggle('theme-dark', theme === 'dark');
  themeToggle.textContent = theme === 'light' ? '☀️ Light mode' : '🌙 Dark mode';
}

function formatClock(value) {
  if (!value) return '--:--';
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDay(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function toCelsius(value) {
  return (value - 32) * (5 / 9);
}

function getNarrativeText({ weatherLabel, temperature, feelsLike, humidity, wind, rainChance, cityName, precipitationType }) {
  const tempDescriptor = temperature >= 28
    ? 'hot and energetic'
    : temperature >= 18
      ? 'mild and comfortable'
      : temperature >= 8
        ? 'cool with a crisp edge'
        : 'chilly and brisk';

  const rainDescriptor = precipitationType === 'rain'
    ? `Expect a little moisture in the air, with a ${rainChance}% chance of rain.`
    : precipitationType === 'snow'
      ? `There’s a ${rainChance}% chance of snow, so conditions may feel especially cold.`
      : `Conditions are fairly stable, with a ${rainChance}% chance of precipitation.`;

  return `${cityName} is feeling ${weatherLabel.toLowerCase()} with a temperature of ${Math.round(temperature)}°C. It feels like ${Math.round(feelsLike)}°C and the air is ${humidity}% humid. Winds are moving at about ${Math.round(wind)} km/h, making the day ${tempDescriptor}. ${rainDescriptor}`;
}

function getWeatherSummary(code, temperature) {
  const current = weatherCodeMap[code] || { label: 'Conditions', icon: '🌤️' };

  if (temperature >= 30) return `${current.label} and very warm.`;
  if (temperature >= 20) return `${current.label} with mild conditions.`;
  if (temperature >= 10) return `${current.label} and pleasantly cool.`;
  if (temperature >= 0) return `${current.label} with a brisk chill.`;
  return `${current.label} and cold.`;
}

function renderForecast(days) {
  forecastEl.innerHTML = '';

  days.forEach((day) => {
    const card = document.createElement('article');
    card.className = 'day-card';

    const name = document.createElement('div');
    name.className = 'day-name';
    name.textContent = formatDay(day.date);

    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.textContent = weatherCodeMap[day.weather_code]?.icon || '🌤️';

    const range = document.createElement('div');
    range.className = 'range';
    range.textContent = `${Math.round(day.tempMin)}° / ${Math.round(day.tempMax)}°`;

    card.append(name, icon, range);
    forecastEl.append(card);
  });
}

function renderWeather(data) {
  const current = data.current;
  const daily = data.daily;
  const weatherInfo = weatherCodeMap[current.weather_code] || weatherCodeMap[0];
  const currentTemp = current.temperature_2m;
  const feelsLike = current.apparent_temperature;
  const wind = current.wind_speed_10m;
  const rainChance = current.precipitation_probability ?? 0;

  locationNameEl.textContent = `${data.location.name}, ${data.location.country}`;
  weatherIconEl.textContent = weatherInfo.icon;
  temperatureEl.textContent = `${Math.round(currentTemp)}°C`;
  summaryEl.textContent = getWeatherSummary(current.weather_code, currentTemp);
  feelsLikeEl.textContent = `${Math.round(feelsLike)}°C`;
  humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  windEl.textContent = `${Math.round(wind)} km/h`;
  rainChanceEl.textContent = `${Math.round(rainChance)}%`;
  sunriseEl.textContent = formatClock(data.daily.sunrise[0]);
  sunsetEl.textContent = formatClock(data.daily.sunset[0]);

  const precipitationType = current.precipitation > 0
    ? current.temperature_2m <= 0
      ? 'snow'
      : 'rain'
    : 'clear';

  narrativeEl.textContent = getNarrativeText({
    weatherLabel: weatherInfo.label,
    temperature: currentTemp,
    feelsLike,
    humidity: Math.round(current.relative_humidity_2m),
    wind,
    rainChance,
    cityName: data.location.name,
    precipitationType
  });

  renderForecast(
    daily.time.map((date, index) => ({
      date,
      weather_code: daily.weather_code[index],
      tempMin: daily.temperature_2m_min[index],
      tempMax: daily.temperature_2m_max[index]
    }))
  );
}

async function reverseGeocode(latitude, longitude) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&language=en&format=json`
  );

  if (!response.ok) {
    throw new Error('Could not identify your location.');
  }

  const data = await response.json();
  const place = data.results?.[0];

  if (!place) {
    throw new Error('Could not find a nearby city.');
  }

  return {
    name: place.name,
    country: place.country || place.admin1 || 'Unknown region'
  };
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
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=5&timezone=auto`
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
    daily: payload.daily
  };
}

async function fetchWeatherForCoordinates(latitude, longitude) {
  const place = await reverseGeocode(latitude, longitude);

  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=5&timezone=auto`
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
    daily: payload.daily
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

async function loadWeatherFromUserLocation() {
  if (!navigator.geolocation) {
    setStatus('Geolocation is not supported on this browser.', true);
    return;
  }

  setStatus('Locating you...');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const data = await fetchWeatherForCoordinates(
          position.coords.latitude,
          position.coords.longitude
        );
        cityInput.value = data.location.name;
        renderWeather(data);
        setStatus(`Showing weather for ${data.location.name}.`);
      } catch (error) {
        setStatus(error.message || 'Unable to fetch local weather.', true);
      }
    },
    () => {
      setStatus('Location permission was denied. Try searching for a city instead.', true);
    }
  );
}

searchButton.addEventListener('click', loadWeatherForInput);
useLocationButton.addEventListener('click', loadWeatherFromUserLocation);
cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    loadWeatherForInput();
  }
});

themeToggle.addEventListener('click', () => {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

setTheme('dark');
loadWeatherForInput();
