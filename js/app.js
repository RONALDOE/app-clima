const inputCiudad = document.getElementById('ciudad');
const btnBuscar = document.getElementById('buscar');
const btnGps = document.getElementById('btn-gps');
const divWrapper = document.getElementById('resultado-wrapper');
const divHistorial = document.getElementById('historial');
const btnTema = document.getElementById('toggle-tema');

// --- 1. Modo Oscuro ---
if (localStorage.getItem('temaOscuro') === 'true') {
    document.body.classList.add('dark-mode');
}

btnTema.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('temaOscuro', document.body.classList.contains('dark-mode'));
});

// --- 2. Historial Reparado ---
let historial = JSON.parse(localStorage.getItem('ciudades')) || [];

const renderizarHistorial = () => {
    divHistorial.innerHTML = '';
    // Agregamos un pequeño margen de seguridad para que no se peguen las palabras
    divHistorial.style.display = 'flex';
    divHistorial.style.gap = '10px'; 
    divHistorial.style.flexWrap = 'wrap';

    historial.forEach(ciudad => {
        const chip = document.createElement('span');
        chip.className = 'chip';
        chip.textContent = ciudad;
        chip.onclick = () => { inputCiudad.value = ciudad; ejecutarBusqueda(ciudad); };
        divHistorial.appendChild(chip);
    });
};

const guardarHistorial = (ciudad) => {
    if (!historial.includes(ciudad)) {
        historial.unshift(ciudad);
        if (historial.length > 3) historial.pop();
        localStorage.setItem('ciudades', JSON.stringify(historial));
        renderizarHistorial();
    }
};

// --- 3. UI de Carga (Skeletons de 3 Columnas) ---
const mostrarLoading = () => {
    divWrapper.innerHTML = `
        <div class="dashboard-pro animacion-aparecer">
            <div class="panel-glass panel-principal">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-img"></div>
                <div class="skeleton skeleton-title"></div>
            </div>
            <div class="panel-glass">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
            <div class="panel-glass">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
    `;
};

// --- 4. Renderizado Final (3 Columnas Pro) ---
const mostrarClimaReal = (data) => {
    const { name, main: { temp, feels_like, humidity }, weather, wind: { speed } } = data;
    const icono = `https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`;
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Mock del pronóstico para la 3ra columna
    const diasSimulados = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue'];
    const pronosticoHTML = diasSimulados.map((dia, index) => {
        const altura = 40 + (index * 12); // Animación visual de las barras
        return `
            <div class="dia-item">
                <strong>${dia}</strong>
                <span style="font-size: 1.2rem; margin: 5px 0;">☀️</span>
                <strong>${temp + 2}°</strong>
                <div class="barra-fondo" style="height: 60px; width: 8px; background: rgba(128,128,128,0.2); border-radius: 10px; display: flex; align-items: flex-end; margin-top: 5px;">
                    <div class="barra-llena" style="width: 100%; height: ${altura}%; background: linear-gradient(to top, #007BFF, #00f2fe); border-radius: 10px;"></div>
                </div>
            </div>
        `;
    }).join('');

    // Inyectamos la estructura asegurando que los estilos no se rompan
    divWrapper.innerHTML = `
        <div class="animacion-aparecer dashboard-pro">
            
            <div class="panel-glass panel-principal">
                <h3>${name}</h3>
                <p style="font-size: 0.8rem; opacity: 0.7;">🕒 Actualizado: ${hora}</p>
                <div class="temp-gigante" style="font-size: 3.5rem; font-weight: bold; color: #007BFF; margin: 15px 0;">${temp}°C</div>
                <img src="${icono}" alt="Icono" style="width: 100px;">
                <p class="descripcion" style="text-transform: capitalize; font-weight: bold;">${weather[0].description}</p>
            </div>

            <div class="panel-glass">
                <h4 style="border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 10px; margin-bottom: 15px; text-align: left;">Detalles para hoy</h4>
                <ul style="list-style: none; padding: 0; display: flex; flex-direction: column; gap: 15px;">
                    <li style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(128,128,128,0.1); padding-bottom: 8px;">
                        <span style="opacity: 0.8;">Sensación Real</span> <strong>${feels_like}°C</strong>
                    </li>
                    <li style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(128,128,128,0.1); padding-bottom: 8px;">
                        <span style="opacity: 0.8;">Humedad</span> <strong>${humidity}%</strong>
                    </li>
                    <li style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(128,128,128,0.1); padding-bottom: 8px;">
                        <span style="opacity: 0.8;">Vientos</span> <strong>${speed} km/h</strong>
                    </li>
                    <li style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(128,128,128,0.1); padding-bottom: 8px;">
                        <span style="opacity: 0.8;">Precipitación</span> <strong>0 mm</strong>
                    </li>
                </ul>
            </div>

            <div class="panel-glass">
                <h4 style="border-bottom: 1px solid rgba(128,128,128,0.2); padding-bottom: 10px; margin-bottom: 15px; text-align: left;">Próximos días</h4>
                <div style="display: flex; justify-content: space-between; align-items: flex-end; height: 100%; margin-top: 10px;">
                    ${pronosticoHTML}
                </div>
            </div>

        </div>
    `;
};

// --- 5. Lógica de Búsqueda (API Mock) ---
const ejecutarBusqueda = (busqueda) => {
    mostrarLoading();
    setTimeout(() => {
        const nombre = typeof busqueda === 'string' ? busqueda : "Ubicación GPS";
        if(typeof busqueda === 'string') guardarHistorial(busqueda);
        
        // Datos falsos
        const mock = {
            name: nombre,
            main: { temp: 16, feels_like: 22, humidity: 60 },
            weather: [{ main: 'Clouds', description: 'nubes dispersas', icon: '02d' }],
            wind: { speed: 12 }
        };
        mostrarClimaReal(mock);
    }, 1200);
};

// --- 6. Eventos ---
btnBuscar.onclick = () => { if(inputCiudad.value) ejecutarBusqueda(inputCiudad.value); };

btnGps.onclick = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => ejecutarBusqueda({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
            () => alert("Error al obtener ubicación")
        );
    }
};

document.querySelectorAll('.scroll-link').forEach(link => {
    link.onclick = (e) => {
        e.preventDefault();
        document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    };
});

renderizarHistorial();