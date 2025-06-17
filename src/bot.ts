import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import { createClient } from "@libsql/client";
dotenv.config();

// Twitter API credentials from .env
const client = new TwitterApi({
  appKey: process.env.API_KEY!,
  appSecret: process.env.API_SECRET!,
  accessToken: process.env.ACCESS_TOKEN!,
  accessSecret: process.env.ACCESS_TOKEN_SECRET!,
});

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});


interface Results {
  seViene: number;
  noSeViene: number;
}

async function getResults(): Promise<Results> {
  const result = await turso.execute("SELECT vote, COUNT(*) as count FROM votesss GROUP BY vote");

  let seViene = 0;
  let noSeViene = 0;

  (result.rows as unknown as { vote: number; count: number }[]).forEach((row) => {
    if (row.vote === 1) {
      seViene = row.count as number;
    } else if (row.vote === 0) {
      noSeViene = row.count as number;
    }
  });

  return { seViene, noSeViene };
}

async function tweetPercentage() {
  try {
    const dataFetch = await getResults();
    const total = dataFetch.seViene + dataFetch.noSeViene;
    
    if (total === 0) {
      console.log('No votes found, skipping tweet');
      return;
    }
    
    const seVienePercentage = (dataFetch.seViene / total) * 100;
    const tweet = `Se viene en un ${seVienePercentage.toFixed(2)}%.`;

    await client.v2.tweet(tweet);
    console.log('Tweeted:', tweet);
    console.log(`Votes - Se viene: ${dataFetch.seViene}, No se viene: ${dataFetch.noSeViene}, Total: ${total}`);
  } catch (error) {
    console.error('Error tweeting:', error);
  }
}

// Run the bot
tweetPercentage();
