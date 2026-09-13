import { existsSync } from 'node:fs';
import { copyFileSync } from 'node:fs';

const env = '.env';
const example = '.env.example';

if (existsSync(env)) {
  console.log('.env already exists, skipping copy.');
} else {
  copyFileSync(example, env);
  console.log('Copied .env.example to .env');
}
