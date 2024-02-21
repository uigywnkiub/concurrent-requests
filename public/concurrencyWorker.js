const workerLogic = async (concurrencyLimit, requestsPerSecond) => {
  let results = [];
  let chunkSize = 1;

  try {
    for (let index = 1; index <= concurrencyLimit; index++) {
      const isApplyRateLimit = index % requestsPerSecond === 1;

      if (isApplyRateLimit) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index }),
      };

      const response = await fetch("/api/concurrency", options);
      // const response = await fetch(
      //   "http://localhost:3333/concurrency",
      //   options
      // );
      // const response = await fetch("https://concurrent-requests-api-eevywnkeel.vercel.app/api/concurrency", options);
      const data = await response.json();

      if ("error" in data) {
        throw new Error(data.error);
      }

      results.push(data.index);

      if (index % chunkSize === 0) {
        postMessage({ results: [...results] });
        results = [];
        // await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (results.length > 0) {
      postMessage({ results: [...results] });
    }
  } catch (error) {
    postMessage({ error: error.message });
    return { error: error.message };
  }
};

onmessage = async function (event) {
  const { concurrencyLimit, requestsPerSecond } = event.data;
  await workerLogic(concurrencyLimit, requestsPerSecond);
};
