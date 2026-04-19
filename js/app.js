// CLIMA PRO - App del Clima con API Real

const API_KEY = '4d8fb5b93d4af21d66a2948710284366';
const API_BASE = 'https://api.openweathermap.org/data/2.5';

const elements = {
  ciudad: document.getElementById('ciudad'),
  btnBuscar: document.getElementById('btn-buscar'),
  btnGps: document.getElementById('btn-gps'),
  btnTheme: document.getElementById('btn-theme'),
  btnUnit: document.getElementById('btn-unit'),
  historial: document.getElementById('historial'),
  emptyState: document.getElementById('empty-state'),
  loading: document.getElementById('loading'),
  error: document.getElementById('error'),
  weatherDisplay: document.getElementById('weather-display'),
  location: document.getElementById('location'),
  date: document.getElementById('date'),
  weatherIcon: document.getElementById('weather-icon'),
  temp: document.getElementById('temp'),
  description: document.getElementById('description'),
  feelsLike: document.getElementById('feels-like'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  visibility: document.getElementById('visibility'),
  pressure: document.getElementById('pressure'),
  sunrise: document.getElementById('sunrise'),
  sunset: document.getElementById('sunset'),
  forecast: document.getElementById('forecast')
};

let state = {
  unit: localStorage.getItem('unit') || 'metric',
  theme: localStorage.getItem('theme') || 'light',
  history: JSON.parse(localStorage.getItem('history')) || [],
  lastData: null
};

function init() {
  applyTheme();
  updateUnitButton();
  renderHistory();
  setupEventListeners();
}

function applyTheme() {
  document.body.classList.toggle('dark', state.theme === 'dark');
  elements.btnTheme.textContent = state.theme === 'dark' ? String.fromCodePoint(0x2600, 0xFE0F) : String.fromCodePoint(0x1F319);
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', state.theme);
  applyTheme();
}

function updateUnitButton() {
  elements.btnUnit.textContent = state.unit === 'metric' ? String.fromCodePoint(0x00B0) + 'C' : String.fromCodePoint(0x00B0) + 'F';
}

function toggleUnit() {
  state.unit = state.unit === 'metric' ? 'imperial' : 'metric';
  localStorage.setItem('unit', state.unit);
  updateUnitButton();
  if (state.lastData) fetchWeather(state.lastData.name);
}

function showLoading() {
  elements.emptyState.style.display = 'none';
  elements.weatherDisplay.classList.remove('visible');
  elements.error.style.display = 'none';
  elements.loading.style.display = 'block';
}

function hideLoading() {
  elements.loading.style.display = 'none';
}

function showError(message) {
  hideLoading();
  elements.error.textContent = String.fromCodePoint(0x274C) + ' ' + message;
  elements.error.style.display = 'block';
  setTimeout(() => elements.error.style.display = 'none', 5000);
}

function showWeather() {
  hideLoading();
  elements.emptyState.style.display = 'none';
  elements.weatherDisplay.classList.add('visible');
}

function addToHistory(city) {
  const cityName = city.trim().toLowerCase();
  state.history = state.history.filter(c => c.toLowerCase() !== cityName);
  state.history.unshift(city.trim());
  state.history = state.history.slice(0, 5);
  localStorage.setItem('history', JSON.stringify(state.history));
  renderHistory();
}

function renderHistory() {
  elements.historial.innerHTML = state.history
    .map(city => '<span class="chip" data-city="' + city + '">' + city + '</span>')
    .join('');
}

function formatDate() {
  const options = { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' };
  return new Date().toLocaleDateString('es-ES', options);
}

function formatTime(timestamp, timezone) {
  const date = new Date((timestamp + timezone) * 1000);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
}

function getWeatherEmoji(code) {
  const emojis = {
    '01d': String.fromCodePoint(0x2600, 0xFE0F), '01n': String.fromCodePoint(0x1F319),
    '02d': String.fromCodePoint(0x26C5), '02n': String.fromCodePoint(0x2601, 0xFE0F),
    '03d': String.fromCodePoint(0x2601, 0xFE0F), '03n': String.fromCodePoint(0x2601, 0xFE0F),
    '04d': String.fromCodePoint(0x2601, 0xFE0F), '04n': String.fromCodePoint(0x2601, 0xFE0F),
    '09d': String.fromCodePoint(0x1F327, 0xFE0F), '09n': String.fromCodePoint(0x1F327, 0xFE0F),
    '10d': String.fromCodePoint(0x1F326, 0xFE0F), '10n': String.fromCodePoint(0x1F327, 0xFE0F),
    '11d': String.fromCodePoint(0x26C8, 0xFE0F), '11n': String.fromCodePoint(0x26C8, 0xFE0F),
    '13d': String.fromCodePoint(0x2744, 0xFE0F), '13n': String.fromCodePoint(0x2744, 0xFE0F),
    '50d': String.fromCodePoint(0x1F32B, 0xFE0F), '50n': String.fromCodePoint(0x1F32B, 0xFE0F)
  };
  return emojis[code] || String.fromCodePoint(0x1F324, 0xFE0F);
}

async function fetchWeather(city) {
  showLoading();
  try {
    const url = API_BASE + '/weather?q=' + encodeURIComponent(city) + '&units=' + state.unit + '&lang=es&appid=' + API_KEY;
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) throw new Error('Ciudad no encontrada.');
      throw new Error('Error al obtener datos del clima.');
    }
    const data = await response.json();
    state.lastData = data;
    addToHistory(data.name);
    displayWeather(data);
    fetchForecast(data.coord.lat, data.coord.lon);
  } catch (error) {
    showError(error.message);
  }
}

async function fetchWeatherByCoords(lat, lon) {
  showLoading();
  try {
    const url = API_BASE + '/weather?lat=' + lat + '&lon=' + lon + '&units=' + state.unit + '&lang=es&appid=' + API_KEY;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error al obtener datos del clima.');
    const data = await response.json();
    state.lastData = data;
    addToHistory(data.name);
    displayWeather(data);
    fetchForecast(lat, lon);
  } catch (error) {
    showError(error.message);
  }
}

async function fetchForecast(lat, lon) {
  try {
    const url = API_BASE + '/forecast?lat=' + lat + '&lon=' + lon + '&units=' + state.unit + '&lang=es&appid=' + API_KEY;
    const response = await fetch(url);
    if (!response.ok) return;
    const data = await response.json();
    displayForecast(data);
  } catch (error) {
    console.error('Error al cargar pronostico:', error);
  }
}

function displayWeather(data) {
  const { name, sys, main, weather, wind, visibility: vis, timezone } = data;
  const unitSymbol = state.unit === 'metric' ? String.fromCodePoint(0x00B0) + 'C' : String.fromCodePoint(0x00B0) + 'F';
  const speedUnit = state.unit === 'metric' ? 'km/h' : 'mph';
  const windSpeed = state.unit === 'metric' ? (wind.speed * 3.6).toFixed(1) : wind.speed.toFixed(1);
  
  elements.location.textContent = name + ', ' + sys.country;
  elements.date.textContent = formatDate();
  elements.weatherIcon.src = 'https://openweathermap.org/img/wn/' + weather[0].icon + '@4x.png';
  elements.weatherIcon.alt = weather[0].description;
  elements.temp.innerHTML = Math.round(main.temp) + '<span class="unit">' + unitSymbol + '</span>';
  elements.description.textContent = weather[0].description;
  elements.feelsLike.textContent = 'Sensacion termica: ' + Math.round(main.feels_like) + unitSymbol;
  elements.humidity.textContent = main.humidity + '%';
  elements.wind.textContent = windSpeed + ' ' + speedUnit;
  elements.visibility.textContent = (vis / 1000).toFixed(1) + ' km';
  elements.pressure.textContent = main.pressure + ' hPa';
  elements.sunrise.textContent = formatTime(sys.sunrise, timezone);
  elements.sunset.textContent = formatTime(sys.sunset, timezone);
  showWeather();
}

function displayForecast(data) {
  const dailyData = {};
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString('es-ES', { weekday: 'short' });
    if (!dailyData[date]) {
      dailyData[date] = { temps: [], icon: item.weather[0].icon };
    }
    dailyData[date].temps.push(item.main.temp);
  });
  
  const days = Object.entries(dailyData).slice(0, 5);
  const unitSymbol = state.unit === 'metric' ? String.fromCodePoint(0x00B0) : String.fromCodePoint(0x00B0) + 'F';
  
  elements.forecast.innerHTML = days.map(function([day, info]) {
    const maxTemp = Math.round(Math.max(...info.temps));
    const minTemp = Math.round(Math.min(...info.temps));
    return '<div class="forecast-day">' +
      '<div class="forecast-day-name">' + day + '</div>' +
      '<span class="forecast-day-icon">' + getWeatherEmoji(info.icon) + '</span>' +
      '<div class="forecast-day-temp">' + maxTemp + unitSymbol +
      ' <span class="forecast-day-temp-low">' + minTemp + unitSymbol + '</span></div></div>';
  }).join('');
}

function getLocation() {
  if (!navigator.geolocation) {
    showError('Tu navegador no soporta geolocalizacion.');
    return;
  }
  showLoading();
  navigator.geolocation.getCurrentPosition(
    (position) => fetchWeatherByCoords(position.coords.latitude, position.coords.longitude),
    (error) => {
      let message = 'Error al obtener ubicacion.';
      if (error.code === 1) message = 'Permiso de ubicacion denegado.';
      if (error.code === 2) message = 'Ubicacion no disponible.';
      if (error.code === 3) message = 'Tiempo de espera agotado.';
      showError(message);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function setupEventListeners() {
  elements.btnBuscar.addEventListener('click', () => {
    const city = elements.ciudad.value.trim();
    if (city) fetchWeather(city);
  });
  
  elements.ciudad.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const city = elements.ciudad.value.trim();
      if (city) fetchWeather(city);
    }
  });
  
  elements.btnGps.addEventListener('click', getLocation);
  elements.btnTheme.addEventListener('click', toggleTheme);
  elements.btnUnit.addEventListener('click', toggleUnit);
  
  elements.historial.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      const city = e.target.dataset.city;
      elements.ciudad.value = city;
      fetchWeather(city);
    }
  });
}

init();
