# Angular Definition Extractor

Extracts static definitions of Angular components and modules using ts-morph and TypeScript compiler API.

## Installation

```bash
npm install @your-scope/angular-definition-extractor
```

## Usage

```ts
import { extractFromFile } from "@your-scope/angular-definition-extractor";

const def = extractFromFile("src/app/app.component.ts");
console.log(def);
```