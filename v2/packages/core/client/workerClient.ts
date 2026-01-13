import { RpcRequest, RpcResponse } from "../core/types";

export class WorkerClient {
	private worker: Worker;
	private pending = new Map<string, (value: any) => void>();

	constructor(worker: Worker) {
		this.worker = worker;

		worker.onmessage = (event) => {
			const message = event.data as RpcResponse;
			const resolve = this.pending.get(message.id);
			if (!resolve) return;

			this.pending.delete(message.id);
			resolve(message.result);
		};
	}

	call<TParams, TResult>(method: string, params: TParams): Promise<TResult> {
		const id = crypto.randomUUID();

		const request: RpcRequest = {
			id,
			method,
			params,
		};

		this.worker.postMessage(request);

		return new Promise((resolve) => {
			this.pending.set(id, resolve);
		});
	}
}
