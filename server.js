const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();


// Registrar todas las solicitudes entrantes
app.use((req, res, next) => {
    console.log('Solicitud recibida:', req.method, req.url);
    next();
  });

  
// Middleware para redireccionar de letstourtec.com a www.letstourtec.com
app.use((req, res, next) => {
  const host = req.headers.host;
  if (host === 'letstourtec.com' || host === 'www.letstourtec.com') {
      // Asegúrate de que la solicitud es HTTPS
      const protocol = req.headers['x-forwarded-proto'] || req.protocol;
      if (protocol !== 'https') {
          return res.redirect(301, 'https://' + host + req.url);
      }
  }
  if (host === 'letstourtec.com') {
      return res.redirect(301, 'https://www.letstourtec.com' + req.url);
  }
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

