/**
 * 
 * @param {import("tsup").Options} options 
 * @returns {import("tsup").Options | import("tsup").Options[] | ((overrideOptions: import("tsup").Options) => import("tsup").Options | import("tsup").Options[])}
 */
export const getDefaultConfig = (options) => {
	return {
		entry: ["src/**/*.ts"],
		clean: true,
		target: "es2024",
		cjsInterop: true,
		format: ["esm", "cjs"],
		minify: !options.watch,
		watch: options.watch,
		dts: true,
		bundle: false,
	};
};
