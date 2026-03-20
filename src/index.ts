import { env } from './config/env';
import { createApp } from './app';

const app = createApp();

app.listen(env.port, () => {
  console.log(`Afro Social Platform API running on port ${env.port} [${env.nodeEnv}]`);
});
