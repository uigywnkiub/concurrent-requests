"use client";
import { useState, useRef, useEffect, ChangeEvent } from "react";

export default function ConcurrentRequests() {
  const [concurrencyLimit, setConcurrencyLimit] = useState(8);
  const [requestsPerSecond, setRequestsPerSecond] = useState(1);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [clearButtonDisabled, setClearButtonDisabled] = useState(true);
  const [results, setResults] = useState<number[]>([]);
  const [errorText, setErrorText] = useState("");
  const resultsEndRef = useRef<HTMLLIElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const handleStart = async () => {
    setResults([]);
    setButtonDisabled(true);
    setClearButtonDisabled(true);
    setErrorText("");
    let resultQty = 0;

    const worker = new Worker("/concurrencyWorker.js");
    worker.postMessage({ concurrencyLimit, requestsPerSecond });
    worker.onmessage = (event) => {
      const { results, error } = event.data;

      if (error) {
        setErrorText(error);
        clearButtonsState();
      }

      setResults((prevResults) => [...prevResults, results]);

      resultQty++;

      if (resultQty >= concurrencyLimit) {
        clearButtonsState();
      }
    };
  };

  const clearButtonsState = () => {
    setButtonDisabled(false);
    setClearButtonDisabled(false);
  };

  const handleClear = () => {
    setResults([]);
    setClearButtonDisabled(true);
    setErrorText("");
  };

  const scrollToBottom = () => {
    resultsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [results]);

  const onChangeInputValue = (
    e: ChangeEvent<HTMLInputElement>,
    inputId: "concurrencyLimit" | "requestsPerSecond"
  ) => {
    const value = e.target.value;
    if (isNaN(parseInt(value)) && value === "") return;
    if (value.length > 4) return;

    if (inputId === "concurrencyLimit") setConcurrencyLimit(parseInt(value));
    if (inputId === "requestsPerSecond") setRequestsPerSecond(parseInt(value));
  };

  return (
    <div ref={topRef} className="grid gap-4 my-8">
      <div>
        <label
          htmlFor="concurrencyLimit"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Select a concurrency limit number:
        </label>
        <input
          type="number"
          id="concurrencyLimit"
          aria-describedby="concurrency limit number"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="10"
          min="0"
          max="100"
          value={concurrencyLimit}
          onChange={(e) => onChangeInputValue(e, "concurrencyLimit")}
          required
        ></input>
      </div>
      <div>
        <label
          htmlFor="requestsPerSecond"
          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
        >
          Select a request per second number:
        </label>
        <input
          type="number"
          id="requestsPerSecond"
          aria-describedby="request per second number"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="15"
          min="0"
          max="100"
          value={requestsPerSecond}
          onChange={(e) => onChangeInputValue(e, "requestsPerSecond")}
          required
        ></input>
      </div>
      <button
        type="button"
        role="button"
        className="sticky top-6 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleStart}
        disabled={buttonDisabled}
      >
        {buttonDisabled ? "Loading..." : "Start"}
      </button>
      <ul className="text-center">
        {results?.filter(Boolean).map((result, idx) => (
          <li key={result ?? idx} ref={resultsEndRef}>
            Response: <span className="font-semibold">{result}</span>
          </li>
        ))}
        {errorText && (
          <li className="text-red-500 font-semibold mt-4">{errorText}</li>
        )}
      </ul>
      {!clearButtonDisabled && (
        <>
          <svg
            className="w-6 h-6 text-gray-800 m-auto dark:text-white cursor-pointer hover:opacity-50"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            onClick={scrollToTop}
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m5 15 7-7 7 7"
            />
          </svg>
          <button
            type="button"
            className="sticky bottom-6 py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
            onClick={handleClear}
            disabled={clearButtonDisabled}
          >
            Clear Results
          </button>
        </>
      )}
    </div>
  );
}
