export interface ComponentIoDefinition {
	name: string;
	type: ValidationSchema;
}

export interface ComponentDefinition {
	kind: "component";
	name: string;
	selector?: string;
	standalone: boolean;
	inputs: ComponentIoDefinition[];
	outputs: ComponentIoDefinition[];
	sourceFilePath: string;
}

export interface ModuleDefinition {
	kind: "module";
	name: string;
	declarations: string[];
	imports: string[];
	exports: string[];
	providers: string[];
	declaredComponents?: ComponentDefinition[];
	sourceFilePath: string;
}

export type ValidationSchema =
	| { kind: "string" }
	| { kind: "number" }
	| { kind: "boolean" }
	| { kind: "array"; element: ValidationSchema }
	| {
			kind: "object";
			properties: Record<string, ValidationSchema>;
			required: string[];
	  }
	| { kind: "union"; variants: ValidationSchema[] }
	| { kind: "unknown" }
	| { kind: "circular" };
