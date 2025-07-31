const Timer = (() => {
  const tiempos = {};

  return {
    start(nombre = 'Proceso') {
      tiempos[nombre] = Date.now();
    },

    stop(nombre = 'Proceso') {
      const fin = Date.now();
      const inicio = tiempos[nombre];

      if (!inicio) {
        console.warn(`⏱ Timer "${nombre}" no fue iniciado`);
        return;
      }

      const duracion = ((fin - inicio) / 1000).toFixed(3);
      console.log(`⏱ [${nombre}] Tiempo de ejecución: ${duracion} segundos`);
      delete tiempos[nombre];
      return duracion;
    },
  };
})();

export default Timer;
