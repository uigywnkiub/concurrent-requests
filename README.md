# Concurrent Requests

This project features client-serverless data fetching with a worker. The input fields set concurrency requests limit and requests per second limit. Server responds with an index from the passed worker's POST request. If over 50 requests/sec, server returns 429 error. Client displays responses with every index number with user limits.

## Warning

On deployment may work not as on the local machine.

## Flow

1/2

<img width="1203" alt="SCR-20240215-qsom" src="https://github.com/uigywnkiub/concurrent-requests/assets/29861553/064ade4a-70d5-4151-9b55-aa6f3e7a83c2">

2/2

<img width="542" alt="SCR-20240215-qwia" src="https://github.com/uigywnkiub/concurrent-requests/assets/29861553/c3017f00-8866-4dfe-b2d4-f1f458b0cf8a">
