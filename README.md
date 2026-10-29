const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const useLocationButton = document.getElementById('useLocationButton');
const themeToggle = document.getElementById('themeToggle');
const unitToggle = document.getElementById('unitToggle');
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
const recommendationEl = document.getElementById('recommendation');
const forecastEl = document.getElementById('forecast');
const hourlyForecastEl = document.getElementById('hourlyForecast');

const defaultLocation = 'London';
let currentTheme = 'dark';
let currentUnit = 'C';
let currentWeatherData = null;

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

function cToF(value) {
  return (value * 9) / 5 + 32;
}

function formatTemp(value) {
  const converted = currentUnit === 'F' ? cToF(value) : value;
  return `${Math.round(converted)}°${currentUnit}`;
}

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

function getRecommendation(currentTemp, humidity, rainChance, weatherLabel) {
  if (currentTemp >= 30) {
    return 'It is hot outside, so carry water, stay shaded, and plan any outdoor activity earlier in the day.';
  }

  if (currentTemp >= 20) {
    return 'Conditions are comfortable for most activities. A light layer is a good idea if the wind picks up.';
  }

  if (currentTemp >= 10) {
    return 'It will feel cool and manageable. A light jacket is a smart choice for the evening.';
  }

  if (rainChance >= 50 || /rain|drizzle|storm/i.test(weatherLabel)) {
    return 'Rain is likely, so keep an umbrella handy and plan for a slower outdoor pace.';
  }

  return 'Expect cooler air and calmer conditions, so layer up and enjoy a slower, more comfortable day outside.';
}

function getNarrativeText({ weatherLabel, temperature, feelsLike, humidity, wind, rainChance, cityName }) {
  const tempDescriptor = temperature >= 28
    ? 'warm and energetic'
    : temperature >= 18
      ? 'mild and comfortable'
      : temperature >= 8
        ? 'cool with a crisp edge'
        : 'chilly and brisk';

  const rainDescriptor = rainChance >= 50
    ? `There is a ${rainChance}% chance of precipitation.`
    : `Conditions look fairly stable, with a ${rainChance}% chance of precipitation.`;

  return `${cityName} is ${weatherLabel.toLowerCase()} with a temperature of ${formatTemp(temperature)}. It feels like ${formatTemp(feelsLike)}, with ${humidity}% humidity and winds around ${Math.round(wind)} km/h. The atmosphere feels ${tempDescriptor}. ${rainDescriptor}`;
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
    range.textContent = `${formatTemp(day.tempMin)} / ${formatTemp(day.tempMax)}`;

    card.append(name, icon, range);
    forecastEl.append(card);
  });
}

function renderHourly(hourly) {
  hourlyForecastEl.innerHTML = '';

  const times = hourly.time.slice(0, 12);
  const temps = hourly.temperature_2m.slice(0, 12);
  const codes = hourly.weather_code.slice(0, 12);
  const precip = hourly.precipitation_probability.slice(0, 12);

  times.forEach((time, index) => {
    const card = document.createElement('article');
    card.className = 'hour-card';

    const hourLabel = document.createElement('div');
    hourLabel.className = 'hour-name';
    hourLabel.textContent = new Date(time).toLocaleTimeString([], { hour: 'numeric' });

    const icon = document.createElement('div');
    icon.className = 'icon';
    icon.textContent = weatherCodeMap[codes[index]]?.icon || '🌤️';

    const temp = document.createElement('div');
    temp.className = 'temp';
    temp.textContent = formatTemp(temps[index]);

    const chance = document.createElement('div');
    chance.className = 'range';
    chance.textContent = `${Math.round(precip[index])}% rain`;

    card.append(hourLabel, icon, temp, chance);
    hourlyForecastEl.append(card);
  });
}

function renderWeather(data) {
  currentWeatherData = data;
  const current = data.current;
  const weatherInfo = weatherCodeMap[current.weather_code] || weatherCodeMap[0];
  const currentTemp = current.temperature_2m;
  const feelsLike = current.apparent_temperature;
  const humidity = Math.round(current.relative_humidity_2m);
  const wind = current.wind_speed_10m;
  const rainChance = current.precipitation_probability ?? 0;

  locationNameEl.textContent = `${data.location.name}, ${data.location.country}`;
  weatherIconEl.textContent = weatherInfo.icon;
  temperatureEl.textContent = formatTemp(currentTemp);
  summaryEl.textContent = getWeatherSummary(current.weather_code, currentTemp);
  feelsLikeEl.textContent = formatTemp(feelsLike);
  humidityEl.textContent = `${humidity}%`;
  windEl.textContent = `${Math.round(wind)} km/h`;
  rainChanceEl.textContent = `${Math.round(rainChance)}%`;
  sunriseEl.textContent = formatClock(data.daily.sunrise[0]);
  sunsetEl.textContent = formatClock(data.daily.sunset[0]);

  narrativeEl.textContent = getNarrativeText({
    weatherLabel: weatherInfo.label,
    temperature: currentTemp,
    feelsLike,
    humidity,
    wind,
    rainChance,
    cityName: data.location.name
  });

  recommendationEl.textContent = getRecommendation(currentTemp, humidity, rainChance, weatherInfo.label);

  renderForecast(
    data.daily.time.map((date, index) => ({
      date,
      weather_code: data.daily.weather_code[index],
      tempMin: data.daily.temperature_2m_min[index],
      tempMax: data.daily.temperature_2m_max[index]
    }))
  );

  renderHourly(data.hourly);
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
    `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,precipitation_probability&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=5&timezone=auto`
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
    hourly: payload.hourly,
    daily: payload.daily
  };
}

async function fetchWeatherForCoordinates(latitude, longitude) {
  const place = await reverseGeocode(latitude, longitude);

  const weatherResponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,precipitation_probability&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&forecast_days=5&timezone=auto`
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
    hourly: payload.hourly,
    daily: payload.daily
  };
}

function refreshDisplayedUnit() {
  if (!currentWeatherData) return;
  renderWeather(currentWeatherData);
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

unitToggle.addEventListener('click', () => {
  currentUnit = currentUnit === 'C' ? 'F' : 'C';
  unitToggle.textContent = currentUnit === 'C' ? '°F' : '°C';
  refreshDisplayedUnit();
});

themeToggle.addEventListener('click', () => {
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

setTheme('dark');
unitToggle.textContent = '°F';
loadWeatherForInput();
