import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next";
// import { Ratelimit } from "@upstash/ratelimit";
// import { Redis } from "@upstash/redis";
import async from "async";

// Utils
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = Math.floor(Math.random() * 1000) + 1;

// Consts
const MAX_REQUESTS_PER_SECOND = 50;

// Interfaces
interface RequestBody {
  index: number;
}

let requests: number[] = [];

const requestQueue = async.queue(
  async (task: RequestBody, callback: async.AsyncResultCallback<any, any>) => {
    try {
      callback();
      // console.log("Request processed:", task.index);
    } catch (error) {
      // console.error("Error processing request:", error);
      callback(error);
    }
  },
  MAX_REQUESTS_PER_SECOND
);

const clearOldTimestamps = () => {
  const currentTime = Date.now();
  requests = requests.filter((timestamp) => currentTime - timestamp < 1000);

  const timeUntilNextSecond = 1000 - (currentTime % 1000);
  setTimeout(clearOldTimestamps, timeUntilNextSecond);
};
clearOldTimestamps();

export const runtime = "edge";

export async function POST(
  req: NextApiRequest & Request,
  res: NextApiResponse
) {
  try {
    const reqData: RequestBody = await req.json();
    const currentTime = Date.now();

    if (typeof reqData.index !== "number") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // requests = requests.filter((timestamp) => currentTime - timestamp < 2000);
    // await delay(randomDelay);

    if (requests.length >= MAX_REQUESTS_PER_SECOND) {
      requests = [];
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    requests.push(currentTime);

    requestQueue.push({ index: reqData.index }, (error?: Error | null) => {
      if (error) {
        // console.error("Error processing request:", error);
      }
    });

    return NextResponse.json({ index: reqData.index }, { status: 200 });
  } catch (error) {
    requests = [];
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/* VARIANT 2 */

// Redis config
// const redis = new Redis({
//   url: "https://us1-thorough-drum-38953.upstash.io",
//   token:
//     "this approach also works but some different...",
// });
// const ratelimit = new Ratelimit({
//   redis,
//   limiter: Ratelimit.tokenBucket(10, "10 s", 100),
//   analytics: true,
//   prefix: "@concurrency-requests",
// });

// export async function POST(
//   req: NextApiRequest & Request,
//   res: NextApiResponse
// ) {
//   try {
//     const reqData: { index: number } = await req.json();

//     // const currentTimestamp = Math.floor(Date.now() / 1000);
//     // const requestKey = `requests:${currentTimestamp}`;
//     // const requestCount = await redis.incr(requestKey);

//     // if (requestCount >= MAX_REQUESTS_PER_SECOND) {
//     //   return NextResponse.json(
//     //     { error: "Rate limit exceeded" },
//     //     { status: 429 }
//     //   );
//     // }

//     // await redis.incr(key);
//     // await redis.expire(key, 1);

//     const { success } = await ratelimit.limit("concurrency-requests");

//     if (!success) {
//       return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
//     }

//     // await delay(randomDelay);

//     return NextResponse.json({ index: reqData.index }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
