import { Project, SyntaxKind } from "ts-morph";
import {
	ComponentDefinition,
	ComponentIoDefinition,
	ModuleDefinition,
} from "../core/types/definition";
import {
	extractClass as extractComponent,
	fileContainComponent,
	getComponentClass,
} from "./angular/extract-component";
import {
	extractModule,
	fileContainsNgModule,
	getNgModuleClass,
} from "./angular/extract-module";
import { writeFile } from "fs/promises";
import { resolve } from "path";

export function extractFromFile(
	filePath: string
): ComponentDefinition | ModuleDefinition {
	const project = new Project({
		tsConfigFilePath: "./tsconfig.json",
	});
	const sourceFile = project.getSourceFileOrThrow(filePath);

	// Try Component first
	if (fileContainComponent(sourceFile)) {
		const component = getComponentClass(sourceFile);
		console.log(`=> Component class found: ${component?.getName()}`);
		return extractComponent(component!);
	}

	// Fallback to NgModule
	if (fileContainsNgModule(sourceFile)) {
		const ngModuleClass = getNgModuleClass(sourceFile);
		console.log(`=> Module class found: ${ngModuleClass?.getName()}`);
		return extractModule(ngModuleClass!, project);
	}

	throw new Error("No Component or NgModule found in source file");
}

export async function extractAllInputsTypes(moduleDef: ModuleDefinition) {
	// for (const component of moduleDef.declaredComponents ?? []) {
	// 	console.log(`Inputs types for component ${component.name} (${component.sourceFilePath}):
	// Primitive types:
	// 	${component.inputs
	// 		.filter(isInputPrimitiveType)
	// 		.map((input) => `${input.name}: ${input.type.kind}`)
	// 		.join(", \n")}

	// Non-primitive types:
	// 	${component.inputs
	// 		.filter((input) => !isInputPrimitiveType(input))
	// 		.map((input) => `${input.name}: ${input.type.kind}`)
	// 		.join(", \n")}
	// 		\n`);
	// }

	const outPath = resolve(process.cwd(), "module-inputs.json");
	console.log(`Writing module inputs types to ${outPath}`);
	await writeFile(outPath, JSON.stringify(moduleDef, null, 4));
}

function isInputPrimitiveType(input: ComponentIoDefinition): boolean {
	return (
		input.type.kind == "string" ||
		input.type.kind == "number" ||
		input.type.kind == "boolean"
	);
}
