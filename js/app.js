const apiKey = 'da336be6c68e6350b390be82950bab5d'; 
const btnBuscar = document.getElementById('buscar');
const inputCiudad = document.getElementById('ciudad');
const divResultado = document.getElementById('resultado');
const links = document.querySelectorAll('.scroll-link');

// Scroll suave para la navegación
links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// Datos de respaldo si falla la API
const usarMock = (ciudad) => {
    console.warn("Error con la API. Cargando datos locales.");
    const dataMock = {
        name: ciudad,
        main: { temp: 28, feels_like: 30, humidity: 75 },
        weather: [{ main: 'Clear', description: "soleado", icon: "01d" }],
        wind: { speed: 4.5 }
    };
    mostrarClima(dataMock);
};

// Fetch a la API de OpenWeather
const obtenerClima = async (ciudad) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        const data = await respuesta.json();

        if (data.cod === 200) {
            mostrarClima(data); 
        } else {
            usarMock(ciudad); 
        }
    } catch (error) {
        usarMock(ciudad); 
    }
};

// Inyección en el DOM y cambio de fondos
const mostrarClima = (data) => {
    const { name, main: { temp, feels_like, humidity }, weather, wind: { speed } } = data;
    const icono = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
    const condicionPrincipal = weather[0].main; 

    const seccionClima = document.getElementById('app-clima');
    seccionClima.className = ''; 

    switch (condicionPrincipal) {
        case 'Clear': seccionClima.classList.add('fondo-soleado'); break;
        case 'Rain':
        case 'Drizzle':
        case 'Thunderstorm': seccionClima.classList.add('fondo-lluvioso'); break;
        case 'Clouds': seccionClima.classList.add('fondo-nublado'); break;
        case 'Snow': seccionClima.classList.add('fondo-nieve'); break;
        default: seccionClima.classList.add('fondo-default'); break;
    }

    divResultado.innerHTML = `
        <div class="clima-principal">
            <h3>${name}</h3>
            <img src="${icono}" alt="Icono del clima">
            <h2 class="temperatura">${temp}°C</h2>
            <p class="descripcion">${weather[0].description.toUpperCase()}</p>
        </div>
        
        <div class="dashboard">
            <div class="tarjeta">
                <span>🌡️ Sensación</span>
                <strong>${feels_like}°C</strong>
            </div>
            <div class="tarjeta">
                <span>💧 Humedad</span>
                <strong>${humidity}%</strong>
            </div>
            <div class="tarjeta">
                <span>💨 Viento</span>
                <strong>${speed} m/s</strong>
            </div>
        </div>
    `;
};

// Event Listeners
btnBuscar.addEventListener('click', () => {
    const ciudad = inputCiudad.value.trim();
    if (ciudad) obtenerClima(ciudad);
});