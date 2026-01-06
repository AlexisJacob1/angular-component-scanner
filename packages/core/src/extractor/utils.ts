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
	if (seen.has(type)) return { kind: "circular" };
	seen.set(type, { kind: "unknown" });

	if (type.isString()) return { kind: "string" };
	if (type.isNumber()) return { kind: "number" };
	if (type.isBoolean()) return { kind: "boolean" };

	// Arrays
	if (type.isArray()) {
		const elementType = type.getArrayElementTypeOrThrow();
		return {
			kind: "array",
			element: resolveValidationSchema(elementType, seen),
		};
	}

	// Unions
	if (type.isUnion()) {
		return {
			kind: "union",
			variants: type
				.getUnionTypes()
				.map((t) => resolveValidationSchema(t, seen)),
		};
	}

	// Type references (interfaces, type aliases, classes)
	const symbol = type.getSymbol();
	if (symbol) {
		const decls = symbol.getDeclarations();

		for (const decl of decls) {
			// Only process type literals or interfaces
			if (
				Node.isInterfaceDeclaration(decl) ||
				Node.isTypeLiteral(decl) ||
				Node.isClassDeclaration(decl)
			) {
				const props = decl
					.getMembers()
					.filter(Node.isPropertySignature)
					.map((p: PropertySignature) => ({
						name: p.getName(),
						type: p.getType(),
						optional: p.hasQuestionToken(),
					}));

				const obj: any = {
					kind: "object",
					properties: {},
					required: [],
				};
				for (const p of props) {
					obj.properties[p.name] = resolveValidationSchema(
						p.type,
						seen
					);
					if (!p.optional) obj.required.push(p.name);
				}
				seen.set(type, obj);
				return obj;
			}
		}
	}

	// Fallback: check object properties
	if (type.isObject()) {
		const props = getObjectProperties(type);
		const obj: any = { kind: "object", properties: {}, required: [] };
		for (const p of props) {
			obj.properties[p.name] = resolveValidationSchema(p.type, seen);
			if (!p.optional) obj.required.push(p.name);
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
