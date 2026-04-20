    // ClimaPro - App del Clima con Fondos Dinamicos
    (function() {
    'use strict';

    var API_KEY = '4d8fb5b93d4af21d66a2948710284366';
    var BASE_URL = 'https://api.openweathermap.org/data/2.5';

    var state = {
        unit: localStorage.getItem('unit') || 'metric',
        theme: localStorage.getItem('theme') || 'light',
        history: JSON.parse(localStorage.getItem('history') || '[]'),
        lastData: null,
        currentWeatherCode: null
    };

    // Mapeo de iconos a GIFs
    var weatherGifMap = {
        '01d': 'sunny',
        '01n': 'night-clear',
        '02d': 'cloudy',
        '02n': 'night-cloudy',
        '03d': 'cloudy',
        '03n': 'night-cloudy',
        '04d': 'cloudy',
        '04n': 'night-cloudy',
        '09d': 'rain',
        '09n': 'rain',
        '10d': 'rain',
        '10n': 'rain',
        '11d': 'thunderstorm',
        '11n': 'thunderstorm',
        '13d': 'snow',
        '13n': 'snow',
        '50d': 'fog',
        '50n': 'fog'
    };

    // DOM Elements
    var elements = {
        searchInput: document.getElementById('searchInput'),
        btnSearch: document.getElementById('btnSearch'),
        btnGps: document.getElementById('btnGps'),
        btnUnit: document.getElementById('btnUnit'),
        btnTheme: document.getElementById('btnTheme'),
        historyChips: document.getElementById('historyChips'),
        loading: document.getElementById('loading'),
        error: document.getElementById('error'),
        emptyState: document.getElementById('emptyState'),
        weatherDisplay: document.getElementById('weatherDisplay'),
        location: document.getElementById('location'),
        date: document.getElementById('date'),
        weatherIconImg: document.getElementById('weatherIconImg'),
        temp: document.getElementById('temp'),
        unitLabel: document.getElementById('unitLabel'),
        description: document.getElementById('description'),
        feelsLike: document.getElementById('feelsLike'),
        humidity: document.getElementById('humidity'),
        wind: document.getElementById('wind'),
        pressure: document.getElementById('pressure'),
        sunrise: document.getElementById('sunrise'),
        sunset: document.getElementById('sunset'),
        visibility: document.getElementById('visibility'),
        forecastGrid: document.getElementById('forecastGrid'),
        weatherBgGif: document.getElementById('weatherBgGif')
    };

    // Inicializar app
    function init() {
        applyTheme();
        updateUnitButton();
        renderHistory();
        setupEventListeners();

        if (state.history.length > 0) {
        fetchWeather(state.history[0]);
        }
    }

    function setupEventListeners() {
        elements.btnSearch.addEventListener('click', handleSearch);
        elements.searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleSearch();
        });
        elements.btnGps.addEventListener('click', handleGps);
        elements.btnUnit.addEventListener('click', toggleUnit);
        elements.btnTheme.addEventListener('click', toggleTheme);
    }

    // Cambiar fondo segun clima
    function updateWeatherBackground(iconCode) {
        var gifName = weatherGifMap[iconCode] || 'cloudy';
        var gifPath = 'assets/weather/' + gifName + '.gif';
        
        state.currentWeatherCode = iconCode;
        
        // Verificar si el GIF existe y aplicarlo
        var testImg = new Image();
        testImg.onload = function() {
        elements.weatherBgGif.style.backgroundImage = 'url(' + gifPath + ')';
        elements.weatherBgGif.classList.add('active');
        };
        testImg.onerror = function() {
        // Si no existe el GIF, ocultar el fondo animado
        elements.weatherBgGif.classList.remove('active');
        };
        testImg.src = gifPath;
    }

    // Fetch weather data
    function fetchWeather(city) {
        showLoading();
        
        var url = BASE_URL + '/weather?q=' + encodeURIComponent(city) + '&appid=' + API_KEY + '&units=' + state.unit + '&lang=es';
        
        fetch(url)
        .then(function(res) {
            if (!res.ok) throw new Error('Ciudad no encontrada');
            return res.json();
        })
        .then(function(data) {
            state.lastData = data;
            displayWeather(data);
            addToHistory(city);
            fetchForecast(data.coord.lat, data.coord.lon);
        })
        .catch(function(err) {
            showError(err.message);
        });
    }

    function fetchWeatherByCoords(lat, lon) {
        showLoading();
        
        var url = BASE_URL + '/weather?lat=' + lat + '&lon=' + lon + '&appid=' + API_KEY + '&units=' + state.unit + '&lang=es';
        
        fetch(url)
        .then(function(res) {
            if (!res.ok) throw new Error('Error al obtener ubicacion');
            return res.json();
        })
        .then(function(data) {
            state.lastData = data;
            displayWeather(data);
            addToHistory(data.name);
            fetchForecast(lat, lon);
        })
        .catch(function(err) {
            showError(err.message);
        });
    }

    function fetchForecast(lat, lon) {
        var url = BASE_URL + '/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + API_KEY + '&units=' + state.unit + '&lang=es';
        
        fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) { displayForecast(data); })
        .catch(function(err) { console.error('Error forecast:', err); });
    }

    // Display weather
    function displayWeather(data) {
        var unitSymbol = state.unit === 'metric' ? String.fromCharCode(176) + 'C' : String.fromCharCode(176) + 'F';
        var windUnit = state.unit === 'metric' ? ' km/h' : ' mph';
        var windSpeed = state.unit === 'metric' ? (data.wind.speed * 3.6).toFixed(1) : data.wind.speed.toFixed(1);
        
        elements.location.textContent = data.name + ', ' + data.sys.country;
        elements.date.textContent = formatDate(new Date());
        
        var iconCode = data.weather[0].icon;
        elements.weatherIconImg.src = 'https://openweathermap.org/img/wn/' + iconCode + '@4x.png';
        elements.weatherIconImg.alt = data.weather[0].description;
        
        elements.temp.innerHTML = Math.round(data.main.temp) + '<span class="unit">' + unitSymbol + '</span>';
        elements.description.textContent = data.weather[0].description;
        elements.feelsLike.textContent = 'Sensacion termica: ' + Math.round(data.main.feels_like) + unitSymbol;
        
        elements.humidity.textContent = data.main.humidity + '%';
        elements.wind.textContent = windSpeed + windUnit;
        elements.pressure.textContent = data.main.pressure + ' hPa';
        elements.sunrise.textContent = formatTime(data.sys.sunrise, data.timezone);
        elements.sunset.textContent = formatTime(data.sys.sunset, data.timezone);
        elements.visibility.textContent = (data.visibility / 1000).toFixed(1) + ' km';
        
        // Actualizar fondo segun clima
        updateWeatherBackground(iconCode);
        
        hideLoading();
        elements.emptyState.style.display = 'none';
        elements.weatherDisplay.classList.add('visible');
    }

    function displayForecast(data) {
        var days = {};
        
        data.list.forEach(function(item) {
        var dateStr = item.dt_txt.split(' ')[0];
        var today = new Date().toISOString().split('T')[0];
        
        if (dateStr === today) return;
        
        if (!days[dateStr]) {
            days[dateStr] = { temps: [], icons: [], item: item };
        }
        days[dateStr].temps.push(item.main.temp);
        days[dateStr].icons.push(item.weather[0].icon);
        });
        
        var html = '';
        var dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        var count = 0;
        
        Object.keys(days).forEach(function(dateStr) {
        if (count >= 5) return;
        
        var dayData = days[dateStr];
        var date = new Date(dateStr);
        var dayName = dayNames[date.getDay()];
        var maxTemp = Math.round(Math.max.apply(null, dayData.temps));
        var minTemp = Math.round(Math.min.apply(null, dayData.temps));
        var icon = dayData.icons[Math.floor(dayData.icons.length / 2)];
        var emoji = getWeatherEmoji(icon);
        
        html += '<div class="forecast-day">';
        html += '<div class="forecast-day-name">' + dayName + '</div>';
        html += '<span class="forecast-day-icon">' + emoji + '</span>';
        html += '<div class="forecast-day-temp">' + maxTemp + String.fromCharCode(176);
        html += ' <span class="forecast-day-temp-low">' + minTemp + String.fromCharCode(176) + '</span>';
        html += '</div></div>';
        
        count++;
        });
        
        elements.forecastGrid.innerHTML = html;
    }

    function getWeatherEmoji(iconCode) {
        var emojis = {
        '01d': String.fromCodePoint(9728),
        '01n': String.fromCodePoint(127769),
        '02d': String.fromCodePoint(9925),
        '02n': String.fromCodePoint(9925),
        '03d': String.fromCodePoint(9729),
        '03n': String.fromCodePoint(9729),
        '04d': String.fromCodePoint(9729),
        '04n': String.fromCodePoint(9729),
        '09d': String.fromCodePoint(127783),
        '09n': String.fromCodePoint(127783),
        '10d': String.fromCodePoint(127782),
        '10n': String.fromCodePoint(127782),
        '11d': String.fromCodePoint(9928),
        '11n': String.fromCodePoint(9928),
        '13d': String.fromCodePoint(10052),
        '13n': String.fromCodePoint(10052),
        '50d': String.fromCodePoint(127787),
        '50n': String.fromCodePoint(127787)
        };
        return emojis[iconCode] || String.fromCodePoint(127326);
    }

    // Handlers
    function handleSearch() {
        var city = elements.searchInput.value.trim();
        if (city) {
        fetchWeather(city);
        elements.searchInput.value = '';
        }
    }

    function handleGps() {
        if (!navigator.geolocation) {
        showError('Geolocalizacion no soportada');
        return;
        }
        
        showLoading();
        navigator.geolocation.getCurrentPosition(
        function(pos) {
            fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        },
        function(err) {
            showError('No se pudo obtener ubicacion');
        }
        );
    }

    function toggleUnit() {
        state.unit = state.unit === 'metric' ? 'imperial' : 'metric';
        localStorage.setItem('unit', state.unit);
        updateUnitButton();
        
        if (state.lastData) {
        fetchWeather(state.lastData.name);
        }
    }

    function toggleTheme() {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', state.theme);
        applyTheme();
    }

    // UI Helpers
    function showLoading() {
        elements.loading.style.display = 'block';
        elements.error.style.display = 'none';
        elements.weatherDisplay.classList.remove('visible');
    }

    function hideLoading() {
        elements.loading.style.display = 'none';
    }

    function showError(msg) {
        elements.loading.style.display = 'none';
        elements.error.textContent = msg;
        elements.error.style.display = 'block';
        elements.emptyState.style.display = 'none';
    }

    function applyTheme() {
        if (state.theme === 'dark') {
        document.body.classList.add('dark');
        elements.btnTheme.innerHTML = String.fromCodePoint(9728);
        } else {
        document.body.classList.remove('dark');
        elements.btnTheme.innerHTML = String.fromCodePoint(127769);
        }
    }

    function updateUnitButton() {
        elements.btnUnit.innerHTML = state.unit === 'metric' ? String.fromCharCode(8451) : String.fromCharCode(8457);
    }

    // History
    function addToHistory(city) {
        var normalized = city.toLowerCase();
        state.history = state.history.filter(function(c) {
        return c.toLowerCase() !== normalized;
        });
        state.history.unshift(city);
        if (state.history.length > 5) {
        state.history = state.history.slice(0, 5);
        }
        localStorage.setItem('history', JSON.stringify(state.history));
        renderHistory();
    }

    function renderHistory() {
        if (state.history.length === 0) {
        elements.historyChips.innerHTML = '';
        return;
        }
        
        var html = '';
        state.history.forEach(function(city) {
        html += '<button class="chip" data-city="' + city + '">' + city + '</button>';
        });
        elements.historyChips.innerHTML = html;
        
        elements.historyChips.querySelectorAll('.chip').forEach(function(chip) {
        chip.addEventListener('click', function() {
            fetchWeather(this.getAttribute('data-city'));
        });
        });
    }

    // Formatters
    function formatDate(date) {
        var dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
        var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        return dias[date.getDay()] + ', ' + date.getDate() + ' de ' + meses[date.getMonth()];
    }

    function formatTime(timestamp, timezone) {
        var date = new Date((timestamp + timezone) * 1000);
        var hours = date.getUTCHours();
        var minutes = date.getUTCMinutes();
        return (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;
    }

    // Start
    init();
    })();
