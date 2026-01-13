import yargs, { ArgumentsCamelCase, Argv } from "yargs";
import {
	extractAllInputsTypes,
	extractFromFile,
	ModuleDefinition,
} from "@sincro/angular-component-scanner-core";
import { resolve } from "path";

type Args = {
	filePath: string;
};

class AnalyzeAngularComponent<Arguments extends Args>
	implements yargs.CommandModule<{}, Arguments>
{
	public command = "analyze-component <filePath>";
	public describe = "Analyze an Angular component file";
	public builder = (yargs: yargs.Argv) => {
		yargs
			.positional("filePath", {
				alias: "path",
				type: "string",
				describe: "Path to the Angular component file to analyze",
				demandOption: true,
			})
			.help();

		return yargs as unknown as Argv<Arguments>;
	};
	public handler = async (args: ArgumentsCamelCase<Arguments>) => {
		const path = resolve(args.filePath);
		console.log(`Analyzing Angular component at: ${path}`);
		const moduleDefinition = await extractFromFile(path);
		// console.log(
		// 	(moduleDefinition as ModuleDefinition).declaredComponents?.map(
		// 		(c) => c.inputs
		// 	)
		// );
		console.log(
			extractAllInputsTypes(moduleDefinition as ModuleDefinition)
		);
	};
}

export = new AnalyzeAngularComponent<Args>();
