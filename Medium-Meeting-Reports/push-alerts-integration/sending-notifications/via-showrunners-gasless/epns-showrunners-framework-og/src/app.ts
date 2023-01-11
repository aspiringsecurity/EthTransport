import 'reflect-metadata'; // We need this in order to use @Decorators

import express from 'express';

import EnvVerifierLoader from './loaders/envVerifier';
import Logger from './loaders/logger';

async function startServer() {
  // Check environment setup first
  Logger.info('✌️   Verifying ENV');
  await EnvVerifierLoader();
  Logger.info('✔️   ENV Verified / Generated and Loaded!');
  // Continue load
  const config = (await require('./config/index')).default;

  // load app
  const app = express();

  /**
   * A little hack here
   * Import/Export can only be used in 'top-level code'
   * Well, at least in node 10 without babel and at the time of writing
   * So we are using good old require.
   **/
  await require('./loaders').default({ expressApp: app });

  app.listen(config.port, err => {
    if (err) {
      Logger.error(err);
      process.exit(1);
      return;
    }

    Logger.info(`
      ################################################


      ███████╗██╗  ██╗ ██████╗ ██╗    ██╗██████╗ ██╗   ██╗███╗   ██╗███╗   ██╗███████╗██████╗ ███████╗    ███████╗████████╗ █████╗  ██████╗ ██╗███╗   ██╗ ██████╗
      ██╔════╝██║  ██║██╔═══██╗██║    ██║██╔══██╗██║   ██║████╗  ██║████╗  ██║██╔════╝██╔══██╗██╔════╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝ ██║████╗  ██║██╔════╝
      ███████╗███████║██║   ██║██║ █╗ ██║██████╔╝██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝███████╗    ███████╗   ██║   ███████║██║  ███╗██║██╔██╗ ██║██║  ███╗
      ╚════██║██╔══██║██║   ██║██║███╗██║██╔══██╗██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗╚════██║    ╚════██║   ██║   ██╔══██║██║   ██║██║██║╚██╗██║██║   ██║
      ███████║██║  ██║╚██████╔╝╚███╔███╔╝██║  ██║╚██████╔╝██║ ╚████║██║ ╚████║███████╗██║  ██║███████║    ███████║   ██║   ██║  ██║╚██████╔╝██║██║ ╚████║╚██████╔╝
      ╚══════╝╚═╝  ╚═╝ ╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝╚══════╝    ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝


      🛡️ Server listening on port: ${config.port} 🛡️

      ################################################
    `);
  });
}

startServer();
