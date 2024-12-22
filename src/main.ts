import 'dotenv';
import { AtpAgent } from 'atproto';
import { getRandomMessage, initDb } from './db.ts';

const agent = new AtpAgent({ service: 'https://bsky.social' });

Deno.cron('new post', { hour: { every: 1 } }, async () => {
  initDb();
  console.log('db initialized');

  await agent.login({
    identifier: 'robtop.voytxt.com',
    password: Deno.env.get('BSKY_PASSWORD')!,
  });
  console.log('logged into bsky');

  const message = await getRandomMessage();
  console.log('got random message');

  await agent.post({ text: message });
  console.log('successfully posted');
});
