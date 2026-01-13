/// <reference lib="webworker" />

import { RpcRequest } from "./interfaces";

self.onmessage = ({data}: MessageEvent<RpcRequest>) => {
	console.log("[Worker] Received:", data);

	// simple example
	self.postMessage({ result: `Echo: ${data}` });
};