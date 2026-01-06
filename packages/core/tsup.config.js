import { defineConfig } from "tsup";
const { getDefaultConfig } = require("../../tsup.config");

export default defineConfig((options) => getDefaultConfig(options));
