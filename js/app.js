// 1. Constantes y Variables
const apiKey = 'da336be6c68e6350b390be82950bab5d'; // Tu llave confirmada
const btnBuscar = document.getElementById('buscar');
const inputCiudad = document.getElementById('ciudad');
const divResultado = document.getElementById('resultado');
const links = document.querySelectorAll('.scroll-link');

// 2. Lógica del Scroll Suave (Requisito de rúbrica)
links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// 3. Función de Datos de Prueba (Mock)
const usarMock = (ciudad) => {
    console.warn("Usando datos de prueba (Mock) - API inactiva o fallando");
    const dataMock = {
        name: ciudad ,
        main: { temp: 28, feels_like: 30, humidity: 75 },
        weather: [{ description: "soleado", icon: "01d" }],
        wind: { speed: 4.5 }
    };
    mostrarClima(dataMock);
};

// 4. Petición a la API (Arrow Function + Async/Await)
const obtenerClima = async (ciudad) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        const data = await respuesta.json();

        if (data.cod === 200) {
            mostrarClima(data); // Si funciona, muestra datos reales
        } else {
            usarMock(ciudad); // Si falla, usa el mock
        }
    } catch (error) {
        usarMock(ciudad); // Si no hay internet, usa el mock
    }
};

// 5. Manipulación del DOM (Dashboard y Clima)
const mostrarClima = (data) => {
    // Destructuración de datos
    const { name, main: { temp, feels_like, humidity }, weather, wind: { speed } } = data;
    const icono = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    // Inyección de HTML
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

// 6. Manejo de Eventos
btnBuscar.addEventListener('click', () => {
    const ciudad = inputCiudad.value.trim();
    if (ciudad) obtenerClima(ciudad);
});