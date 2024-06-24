process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // Puedes agregar opciones de configuración para Jasmine aquí
      },
      clearContext: false // Mantén visible la salida de Jasmine Spec Runner en el navegador
    },
    jasmineHtmlReporter: {
      suppressAll: true // Elimina los rastros duplicados
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/erp-praxa'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' }
      ]
    },
    reporters: ['progress', 'kjhtml'],
    browsers: ['ChromeHeadless'],
    restartOnFileChange: true
  });
};
