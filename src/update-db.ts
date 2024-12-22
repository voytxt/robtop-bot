import wretch from 'wretch';
import FormUrlAddon from 'wretch/addons/formUrl';
import { Buffer } from 'buffer';
import { addMessage, initDb } from './db.ts';

{
  initDb();

  const messages: { id: string; message: string }[] = [];
  for (let i = 0; i < 40; i++) {
    console.log('fetching page', i);
    messages.push(...(await getMessagesOnPage(i)));
    console.log('page', i, 'fetched');

    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log('fetched', messages.length, 'messages in total');

  const results = await Promise.all(messages.map((m) => addMessage(m.id, m.message)));
  console.log('added', results.filter((x) => x).length, 'new messages to the database');
}

/**
 * https://wyliemaster.github.io/gddocs/#/endpoints/comments/getGJCommentHistory
 *
 * page 0 is the first page
 */
async function getMessagesOnPage(page: number): Promise<{ id: string; message: string }[]> {
  return await wretch('http://www.boomlings.com/database/getGJCommentHistory.php')
    .headers({ 'User-Agent': '' })
    .addon(FormUrlAddon)
    .formUrl({ secret: 'Wmfd2893gb7', userID: 16, count: 100, page })
    .post()
    .text((data: string) => {
      if (data === '-1') {
        console.warn('page', page, 'is empty');
        return [];
      }

      return data.split('|').map((c) => {
        const map = c
          .split(':')[0]
          .split('~')
          .reduce((map, curr, i, arr) => {
            return i % 2 === 0 ? map.set(+curr, arr[i + 1]) : map;
          }, new Map<number, string>());

        return {
          id: map.get(6)!,
          message: Buffer.from(map.get(2)!, 'base64').toString(),
        };
      });
    });
}
