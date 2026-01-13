import typescript from "@rollup/plugin-typescript";

export default [
	// Main library
	{
		input: "src/index.ts",
		output: {
			file: "dist/index.js",
			format: "esm",
			sourcemap: true,
		},
		plugins: [typescript({ tsconfig: "./tsconfig.build.json" })],
	},
	// Worker bundle
	{
		input: "src/worker.ts",
		output: {
			file: "dist/worker.js",
			format: "iife", // standalone worker
			sourcemap: true,
		},
		plugins: [typescript({ tsconfig: "./tsconfig.build.json" })],
	},
];
