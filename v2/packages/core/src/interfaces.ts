import { ComponentRef, NgModuleRef, Type } from "@angular/core";

/**
 * Request to scan a module or component for its declared components and submodules.
 */
export interface RpcRequest {
	moduleOrComponentToScan: Type<unknown>;
}

export type ModuleRefResponse<ModuleType> = NgModuleRef<ModuleType> | NgModuleRef<ModuleType>[];
export type ComponentRefResponse<ComponentType> = ComponentRef<ComponentType> | ComponentRef<ComponentType>[];

/**
 * Response containing the scanned components.
 */
export interface RpcResponse<ReponseType extends ModuleRefResponse<unknown> | ComponentRefResponse<unknown>> {
	data: ReponseType;
}
