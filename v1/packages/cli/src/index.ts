import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { name, version, author } from "../package.json";
import { styleText } from "node:util";

yargs(hideBin(process.argv))
	.scriptName(name)
	.version(version)
	.commandDir("commands")
	.demandCommand(1, "You need at least one command before moving on")
	.help()
	.epilogue(
		`ClI interface for ${styleText(
			["bold", "blue"],
			author
		)} (version ${version})`
	)
	.wrap(yargs.terminalWidth())
	.parseAsync();
