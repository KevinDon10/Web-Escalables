import mongoose from 'mongoose';
import { createApp } from './app.ts';
import { connectDatabase } from './config/database.ts';
import { getConfig } from './config/env.ts';

const config = getConfig();

try {
  await connectDatabase(config);
  const app = createApp(config);
  app.listen(config.PORT, () => {
    console.log(`API lista en http://localhost:${config.PORT}`);
  });
} catch (error) {
  console.error('No se pudo iniciar el API:', error);
  await mongoose.disconnect();
  process.exitCode = 1;
}
