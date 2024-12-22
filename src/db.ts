import * as aw from 'appwrite';
import 'dotenv';

let db: aw.Databases | null = null;

export function initDb() {
  const client = new aw.Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('robtop-bot')
    .setKey(Deno.env.get('APPWRITE_API_KEY')!);

  db = new aw.Databases(client);
}

export async function addMessage(id: string, message: string): Promise<boolean> {
  try {
    await db!.createDocument('messages', 'gd', id, { message: message.slice(0, 300) });
    return true;
  } catch {
    return false;
  }
}

export async function getRandomMessage(): Promise<string> {
  const messageCount = (await db!.listDocuments('messages', 'gd')).total;
  const randomOffset = Math.floor(Math.random() * messageCount) - 1;
  console.log(`random message: picked offset ${randomOffset}; message count: ${messageCount}`);

  const randomDocument = (
    await db!.listDocuments('messages', 'gd', [aw.Query.limit(1), aw.Query.offset(randomOffset)])
  ).documents[0] as aw.Models.Document & { message: string };

  return randomDocument.message;
}
