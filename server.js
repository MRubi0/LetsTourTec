const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();


// Registrar todas las solicitudes entrantes
app.use((req, res, next) => {
    console.log('Solicitud recibida:', req.method, req.url);
    next();
  });

  
// Configura el proxy
app.use('/v2', createProxyMiddleware({
  target: 'https://api.openrouteservice.org',
  changeOrigin: true,
  pathRewrite: {
    '^/v2': '',
  },
}));

// Serve only the static files from the dist directory
app.use(express.static('./dist/letstourtec'));

app.get('/*', (req, res) =>
    res.sendFile('index.html', {root: 'dist/letstourtec/'}),
);

// Start the app by listening on the default Heroku port
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});