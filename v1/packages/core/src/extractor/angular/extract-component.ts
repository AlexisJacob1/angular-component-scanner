import {
	ClassDeclaration,
	SourceFile,
	SyntaxKind,
	TypeFormatFlags,
} from "ts-morph";
import {
	ComponentDefinition,
	ComponentIoDefinition,
} from "../../core/types/definition";
import { resolveValidationSchema } from "../utils";

/**
 * Extract the component definition from the given class declaration.
 * @internal
 * @param declaration
 * @returns
 */
export function extractClass(
	declaration: ClassDeclaration
): ComponentDefinition {
	const dec = declaration.getDecorator("Component")!;
	const obj = dec
		.getArguments()[0]
		?.asKind(SyntaxKind.ObjectLiteralExpression);

	const selector = obj
		?.getProperty("selector")
		?.getText()
		?.replace(/['"]/g, "")
		?.replace(/selector: /g, "");

	const standalone = obj?.getProperty("standalone")?.getText() === "true";

	const inputs = [
		...new Set([
			...extractInputsFromDecoratorOfComponent(declaration!),
			...extractInputsFromSignalOfComponent(declaration!),
		]),
	];

	const outputs = [
		...new Set([
			...extractOutputsFromDecoratorOfComponent(declaration!),
			...extractOutputsFromSignalOfComponent(declaration!),
		]),
	];

	return {
		kind: "component",
		name: declaration.getName()!,
		selector,
		standalone: standalone ?? false,
		inputs,
		outputs,
		sourceFilePath: declaration.getSourceFile().getFilePath(),
	};
}

/**
 * Check if the given source file contains a Component declaration.
 * @param sourceFile
 * @returns
 */
export function fileContainComponent(sourceFile: SourceFile): boolean {
	return !!sourceFile.getClasses().find((c) => c.getDecorator("Component"));
}

export function getComponentClass(
	sourceFile: SourceFile
): ClassDeclaration | undefined {
	return sourceFile.getClasses().find((c) => c.getDecorator("Component"));
}

/**
 * Extracts input property names from the given component class.
 * @param component
 */
function extractInputsFromDecoratorOfComponent(
	component: ClassDeclaration
): ComponentIoDefinition[] {
	return [
		// property declarations
		...component
			.getProperties()
			.filter((p) => p.getDecorator("Input"))
			.map((p) => {
				return {
					name: p.getName(),
					type: resolveValidationSchema(p.getType()),
				};
			}),
		// setters
		...component
			.getSetAccessors()
			.filter((s) => s.getDecorator("Input"))
			.map((s) => {
				return {
					name: s.getName(),
					type: resolveValidationSchema(s.getType()),
				};
			}),
	];
}

/**
 * Extract inputs signalproperties from the given component class.
 * @todo use something more robust than text matching
 * @param component
 * @returns
 */
function extractInputsFromSignalOfComponent(
	component: ClassDeclaration
): ComponentIoDefinition[] {
	return component
		.getProperties()
		.filter((p) => {
			const init = p.getInitializer();
			return init?.getText().startsWith("signal(");
		})
		.map((p) => {
			return {
				name: p.getName(),
				type: resolveValidationSchema(p.getType()),
			};
		});
}

/**
 * Extracts outputs property names from the given component class.
 * @param component
 */
function extractOutputsFromDecoratorOfComponent(
	component: ClassDeclaration
): ComponentIoDefinition[] {
	return [
		// property declarations
		...component
			.getProperties()
			.filter((p) => p.getDecorator("Output"))
			.map((p) => {
				return {
					name: p.getName(),
					type: resolveValidationSchema(p.getType()),
				};
			}),
		// setters
		...component
			.getSetAccessors()
			.filter((s) => s.getDecorator("Output"))
			.map((s) => {
				return {
					name: s.getName(),
					type: resolveValidationSchema(s.getType()),
				};
			}),
	];
}

/**
 * Extract outputs signalproperties from the given component class.
 * @todo use something more robust than text matching
 * @param component
 * @returns
 */
function extractOutputsFromSignalOfComponent(
	component: ClassDeclaration
): ComponentIoDefinition[] {
	return component
		.getProperties()
		.filter((p) => {
			const init = p.getInitializer();
			return init?.getText().startsWith("output(");
		})
		.map((p) => {
			return {
				name: p.getName(),
				type: resolveValidationSchema(p.getType()),
			};
		});
}
