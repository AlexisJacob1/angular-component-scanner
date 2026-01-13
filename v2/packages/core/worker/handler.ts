import * as api from "../core/api";
import { RpcRequest, RpcResponse } from "../core/types";

export async function handleMessage(message: RpcRequest) {
	const { id, method, params } = message;

	try {
		const fn = (api as any)[method];
		if (typeof fn !== "function") {
			throw new Error(`Unknown method: ${method}`);
		}

		const result = await fn(params);

		const response: RpcResponse = { id, result };
		self.postMessage(response);
	} catch (err: any) {
		const response: RpcResponse = {
			id,
			error: err?.message ?? "Worker error",
		};
		self.postMessage(response);
	}
}
