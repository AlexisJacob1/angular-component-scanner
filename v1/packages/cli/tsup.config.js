import { defineConfig } from "tsup";
const { getDefaultConfig } = require("../../tsup.config");



export default defineConfig((options) => {
	return {
		...getDefaultConfig(options),
		format: "cjs",
		dts: false
	};
});