const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Expo CLI uses the monorepo root as Metro server root (via workspace detection).
// We must match that: set projectRoot to monorepo root so entry file resolution
// is consistent, but use watchFolders and nodeModulesPaths for correct resolution.
config.projectRoot = monorepoRoot;

// Watch the mobile app and shared packages
config.watchFolders = [projectRoot, path.resolve(monorepoRoot, "packages")];

// Resolve modules from both local and monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Ensure shared package is resolved
config.resolver.disableHierarchicalLookup = false;

module.exports = withNativeWind(config, { input: "./global.css" });
