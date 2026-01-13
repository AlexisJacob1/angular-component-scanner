import yargs, { ArgumentsCamelCase, Argv } from "yargs";
import {
	extractFromFile,
	ModuleDefinition,
} from "@sincro/angular-component-scanner-core";
import { resolve } from "path";
import { cp } from "fs/promises";

type Args = {
	libraryPath: string;
	destinationPath?: string;
};

class CopyDesignSystemCommon<Arguments extends Args>
	implements yargs.CommandModule<{}, Arguments>
{
	public command = "copy-library <libraryPath>";
	public describe = "Copy library for testing";
	public builder = (yargs: yargs.Argv) => {
		yargs
			.positional("libraryPath", {
				type: "string",
				describe: "Path to the Angular library to copy",
				demandOption: true,
			})
			.option("destinationPath", {
				alias: "dest",
				type: "string",
				describe: "Path to copy the library files to",
				demandOption: false,
				default: "./test/library",
			})
			.help();

		return yargs as unknown as Argv<Arguments>;
	};
	public handler = async (args: ArgumentsCamelCase<Arguments>) => {
		const { libraryPath, destinationPath } = args;
		const path = resolve(libraryPath),
			outputPath = resolve(destinationPath!);

		console.log(`Copying library from ${path} to ${outputPath}`);
		await cp(path, outputPath, { recursive: true });
		console.log("Copy completed.");
	};
}

export = new CopyDesignSystemCommon<Args>();
