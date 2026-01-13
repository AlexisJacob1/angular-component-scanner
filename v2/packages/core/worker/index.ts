import { handleMessage } from "./handler";

self.onmessage = (event) => {
	handleMessage(event.data);
};
