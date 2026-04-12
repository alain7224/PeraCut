/**
 * Script para corregir configuración de HMR de Vite en entornos remotos
 * Se ejecuta antes que Vite cargue para detectar el host correcto
 */

(function() {
  // Detectar el host actual del navegador
  const currentHost = window.location.host;
  const currentProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const port = window.location.port ? parseInt(window.location.port) : (currentProtocol === 'wss' ? 443 : 80);

  // Configurar __VITE_HMR__ con el host correcto
  const hmrConfig = {
    protocol: currentProtocol,
    host: currentHost,
    port: port,
    timeout: 30000,
  };

  window.__VITE_HMR__ = hmrConfig;

  // Hacer la configuración inmutable para que Vite no la sobrescriba
  Object.defineProperty(window, '__VITE_HMR__', {
    value: hmrConfig,
    writable: false,
    configurable: false,
  });

  console.log('[PeraCut HMR Fix] Configuración de HMR:', window.__VITE_HMR__);
})();
