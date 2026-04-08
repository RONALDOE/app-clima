// Uso de const y let
const apiKey = 'da336be6c68e6350b390be82950bab5d'; 
const btnBuscar = document.getElementById('buscar');
const inputCiudad = document.getElementById('ciudad');
const divResultado = document.getElementById('resultado');
const links = document.querySelectorAll('.scroll-link');

// 1. Lógica del Scroll Suave 
links.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        // Método scrollIntoView
        targetSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// 2. Fetch a la API con Arrow Functions
const obtenerClima = async (ciudad) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${apiKey}&units=metric&lang=es`;
        const respuesta = await fetch(url);
        const data = await respuesta.json();

        if (data.cod === 200) {
            mostrarClima(data);
        } else {
            divResultado.innerHTML = `<p>⚠️ Ciudad no encontrada.</p>`;
        }
    } catch (error) {
        console.error("Error en la petición:", error); // Evita errores rotos en consola
    }
};

// 3. Manipulación del DOM dinámica
const mostrarClima = (data) => {
    const { name, main: { temp }, weather } = data; // Destructuración
    const icono = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;

    divResultado.innerHTML = `
        <h3>${name}</h3>
        <p>🌡️ Temperatura: ${temp}°C</p>
        <p>☁️ Clima: ${weather[0].description}</p>
        <img src="${icono}" alt="Icono del clima">
    `;
};

// 4. Manejo de Eventos
btnBuscar.addEventListener('click', () => {
    const ciudad = inputCiudad.value.trim();
    if (ciudad) obtenerClima(ciudad);
});