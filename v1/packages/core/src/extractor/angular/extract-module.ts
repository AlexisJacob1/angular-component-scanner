import { ClassDeclaration, Project, SourceFile, SyntaxKind } from "ts-morph";
import {
	ComponentDefinition,
	ModuleDefinition,
} from "../../core/types/definition";
import { extractImportsOfFile } from "../utils";
import {
	extractClass as extractComponent,
	fileContainComponent,
	getComponentClass,
} from "./extract-component";

/**
 * Extract angular module definition from the given class declaration.
 * @internal
 * @param declaration
 * @returns
 */
export function extractModule(
	declaration: ClassDeclaration,
	project: Project
): ModuleDefinition {
	const dec = declaration.getDecorator("NgModule")!;
	const obj = dec
		.getArguments()[0]
		?.asKind(SyntaxKind.ObjectLiteralExpression);

	const parseArray = (propName: string) => {
		const prop = obj
			?.getProperty(propName)
			?.asKind(SyntaxKind.PropertyAssignment);
		if (!prop) {
			return [];
		}

		const initializer = prop.getInitializerIfKind(
			SyntaxKind.ArrayLiteralExpression
		);
		if (!initializer) {
			return [];
		}

		return initializer
			.getElements()
			.map((e) => e.getText().replace(/['"]/g, ""))
			.filter(Boolean);
	};

	return {
		kind: "module",
		name: declaration.getName()!,
		declarations: parseArray("declarations"),
		imports: parseArray("imports"),
		exports: parseArray("exports"),
		providers: parseArray("providers"),
		declaredComponents: extractAllComponentsOfModule(declaration, project),
		sourceFilePath: declaration.getSourceFile().getFilePath(),
	};
}

function extractAllComponentsOfModule(
	declaration: ClassDeclaration,
	project: Project,
	components?: ComponentDefinition[]
): ComponentDefinition[] {
	const sourceFileImports = extractImportsOfFile(
		declaration.getSourceFile(),
		project
	);

	components = components || [];

	for (const { resolvedPath } of sourceFileImports.filter(
		(imp) => !!imp.resolvedPath
	)) {
		const sourceFile = project.getSourceFile(resolvedPath!);

		if (!sourceFile) {
			console.warn(
				`=> Warning: Could not resolve source file at path: ${resolvedPath}`
			);
			continue;
		}

		if (fileContainComponent(sourceFile!)) {
			const component = getComponentClass(sourceFile!);

			if (!component) {
				console.warn(
					`=> Warning: Could not find component class in source file: ${sourceFile.getFilePath()}`
				);
				continue;
			}

			components.push(extractComponent(component!));
		} else if (fileContainsNgModule(sourceFile!)) {
			const ngModuleClass = getNgModuleClass(sourceFile!);
			if (!ngModuleClass) {
				console.warn(
					`=> Warning: Could not find NgModule class in source file: ${sourceFile.getFilePath()}`
				);
				continue;
			}
			extractAllComponentsOfModule(ngModuleClass!, project, components);
		}
	}

	return components;
}

/**
 * Check if the given source file contains an NgModule declaration.
 * @param sourceFile
 * @returns
 */
export function fileContainsNgModule(sourceFile: SourceFile): boolean {
	return sourceFile
		.getClasses()
		.some((c: ClassDeclaration) => isClassNgModule(c));
}

export function getNgModuleClass(
	sourceFile: SourceFile
): ClassDeclaration | undefined {
	return sourceFile.getClasses().find((c) => isClassNgModule(c));
}

/**
 * Check if the given class declaration is an ngModule class
 * @param declaration
 * @returns
 */
export function isClassNgModule(declaration: ClassDeclaration): boolean {
	return !!declaration.getDecorator("NgModule");
}
