import { Node, Project, PropertySignature, SourceFile } from "ts-morph";
import { Type } from "ts-morph";
import { ValidationSchema } from "../core/types/definition";

export function extractImportsOfFile(file: SourceFile, project: Project) {
	return file.getImportDeclarations().map((impor) => {
		const importText = impor.getModuleSpecifierValue();
		const resolvedSourceFile = impor.getModuleSpecifierSourceFile();
		const resolvedPath = resolvedSourceFile
			? project
					.getSourceFiles()
					.find(
						(sf) =>
							sf.getFilePath() ===
							resolvedSourceFile.getFilePath()
					)
					?.getFilePath()
			: null;

		// Default import (import X from 'module')
		const defaultImport = impor.getDefaultImport()?.getText() || null;

		// Named imports (import { A, B } from 'module')
		const namedImports = impor.getNamedImports().map((ni) => ni.getName());

		// Namespace import (import * as NS from 'module')
		const namespaceImport = impor.getNamespaceImport()?.getText() || null;

		return {
			importText,
			resolvedPath,
			defaultImport,
			namedImports,
			namespaceImport,
		};
	});
}

export function resolveValidationSchema(
	type: Type,
	seen = new Map<Type, any>()
): any {
	// Prevent infinite recursion
	if (seen.has(type)) return { kind: "circular" };
	seen.set(type, { kind: "unknown" });

	// Unwrap common Angular generic wrappers
	const symbolName = type.getSymbol()?.getName();
	if (symbolName === "Signal" || symbolName === "EventEmitter") {
		const typeArgs = type.getTypeArguments();
		if (typeArgs.length > 0) {
			return resolveValidationSchema(typeArgs[0], seen);
		}
	}

	// Primitives
	if (type.isString()) return { kind: "string" };
	if (type.isNumber()) return { kind: "number" };
	if (type.isBoolean()) return { kind: "boolean" };

	// Array types
	if (type.isArray()) {
		const elementType = type.getArrayElementTypeOrThrow();
		return {
			kind: "array",
			element: resolveValidationSchema(elementType, seen),
		};
	}

	// Union types
	if (type.isUnion()) {
		return {
			kind: "union",
			variants: type
				.getUnionTypes()
				.map((t) => resolveValidationSchema(t, seen)),
		};
	}

	// Interface / type alias / class
	const symbol = type.getSymbol();
	if (symbol) {
		const decls = symbol.getDeclarations();
		for (const decl of decls) {
			if (
				Node.isInterfaceDeclaration(decl) ||
				Node.isTypeLiteral(decl) ||
				Node.isClassDeclaration(decl)
			) {
				const obj: any = {
					kind: "object",
					properties: {},
					required: [],
				};

				const members = decl
					.getMembers()
					.filter(Node.isPropertySignature);
				for (const p of members) {
					const name = p.getName();
					const propType = p.getType();
					const optional = p.hasQuestionToken();

					obj.properties[name] = resolveValidationSchema(
						propType,
						seen
					);
					if (!optional) obj.required.push(name);
				}

				seen.set(type, obj);
				return obj;
			}
		}
	}

	// Fallback object
	if (type.isObject()) {
		const obj: any = { kind: "object", properties: {}, required: [] };
		for (const prop of type.getProperties()) {
			const decl =
				prop.getValueDeclaration() || prop.getDeclarations()[0];
			if (!decl) continue;

			const propType = decl.getType();
			obj.properties[prop.getName()] = resolveValidationSchema(
				propType,
				seen
			);
			if (!prop.isOptional()) obj.required.push(prop.getName());
		}
		seen.set(type, obj);
		return obj;
	}

	return { kind: "unknown" };
}

function getObjectProperties(
	type: Type
): { name: string; type: Type; optional: boolean }[] {
	const props: { name: string; type: Type; optional: boolean }[] = [];

	for (const prop of type.getProperties()) {
		const decl = prop.getValueDeclaration() || prop.getDeclarations()[0];
		if (!decl) continue;

		const propType = decl.getType();
		const optional = prop.isOptional();
		props.push({ name: prop.getName(), type: propType, optional });
	}

	return props;
}
