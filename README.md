# ClimaPro

Aplicacion web sencilla para consultar el clima actual y el pronostico de 5 dias.

## Caracteristicas

- Busqueda del clima por ciudad.
- Consulta del clima usando la ubicacion actual.
- Cambio de unidades entre Celsius y Fahrenheit.
- Cambio de tema visual.
- Historial de busquedas recientes.
- Fondo dinamico segun el estado del clima.

## Tecnologias

- HTML
- CSS
- JavaScript
- API de OpenWeather

## Estructura del proyecto

```text
app-clima/
|-- index.html
|-- css/
|   `-- styles.css
|-- js/
|   `-- app.js
`-- assets/
    `-- weather/
```

## Uso

1. Abre `index.html` en tu navegador.
2. Escribe el nombre de una ciudad y pulsa Buscar.
3. Tambien puedes usar el boton de ubicacion para consultar el clima de tu zona.

## Nota

La aplicacion consume datos desde OpenWeather. Si necesitas cambiar la clave de la API, puedes hacerlo en el archivo `js/app.js`.