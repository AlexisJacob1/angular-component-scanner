export function createWorker() {
	return new Worker(new URL("./worker.js", import.meta.url), {
		type: "module",
	});
}

export * from "./interfaces";