const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * PUBLIC_INTERFACE
 * Provides lightweight dev-time helpers:
 * - /healthz readiness endpoint for container orchestration (always 200 OK)
 * - Optionally proxy API calls if REACT_APP_API_BASE is set to an absolute URL (disabled by default here)
 *
 * CRA automatically loads this file in development.
 */
module.exports = function(app) {
  // Health/readiness endpoint
  app.get('/healthz', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Optional: If you need to proxy backend during local dev, uncomment and adjust:
  // const target = process.env.REACT_APP_API_BASE;
  // if (target && /^https?:\/\//i.test(target)) {
  //   app.use(
  //     '/api',
  //     createProxyMiddleware({
  //       target,
  //       changeOrigin: true,
  //       secure: false,
  //       logLevel: 'silent',
  //     })
  //   );
  // }
};
