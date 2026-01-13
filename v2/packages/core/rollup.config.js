import typescript from "@rollup/plugin-typescript";
import del from 'rollup-plugin-delete';

export default [
	// Main library
	{
		input: "src/index.ts",
		output: {
			file: "dist/index.js",
			format: "esm",
			sourcemap: true,
		},
		plugins: [
			del({ targets: "dist/*" }),
			typescript({ tsconfig: "./tsconfig.build.json" }),
		],
	},
	// Worker bundle
	{
		input: "src/worker.ts",
		output: {
			file: "dist/worker.js",
			format: "esm", // standalone worker
			sourcemap: true,
		},
		plugins: [
			typescript({ tsconfig: "./tsconfig.build.json" }),
		],
	},
];
