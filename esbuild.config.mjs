import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";
import { join } from "path";
import { copyFileSync } from "fs";

const prod = (process.argv[2] === "production");

const pluginFolderPath = join(process.env.OBSIDIAN_VAULT_PATH, ".obsidian", "plugins", "yfloop");

const sourceJavaScriptFilePath = join(process.cwd(), "main.mjs");
const pluginJavaScriptFilePath = join(pluginFolderPath, "main.js");

const sourceManifestFilePath = join(process.cwd(), "manifest.json");
const pluginManifestFilePath = join(pluginFolderPath, "manifest.json");

const sourceHotreloadFilePath = join(process.cwd(), ".hotreload");
const pluginHotreloadFilePath = join(pluginFolderPath, ".hotreload");

const sourceStylesFilePath = join(process.cwd(), "styles.css");
const pluginStylesFilePath = join(pluginFolderPath, "styles.css");

const copyManifestPlugin = (pairs) => ({
    name: 'copy-manifest-plugin',
    setup(build) {
        build.onEnd(async () => {
			for (const [sourcePath, targetPath] of pairs) {
				try {
					copyFileSync(sourcePath, targetPath);
				}
				catch (e) {
					console.error('Failed to copy file:', e);
				}
			}
            
        });
    },
});

const context = await esbuild.context({
	entryPoints: [sourceJavaScriptFilePath],
	bundle: true,
	external: [
		"obsidian",
		"electron",
		"@codemirror/autocomplete",
		"@codemirror/collab",
		"@codemirror/commands",
		"@codemirror/language",
		"@codemirror/lint",
		"@codemirror/search",
		"@codemirror/state",
		"@codemirror/view",
		"@lezer/common",
		"@lezer/highlight",
		"@lezer/lr",
		...builtins
	],
	plugins: prod
		? []
		: [
			copyManifestPlugin([
				[sourceManifestFilePath, pluginManifestFilePath],
				[sourceHotreloadFilePath, pluginHotreloadFilePath],
				[sourceStylesFilePath, pluginStylesFilePath]
			]),
		],
	format: "cjs",
	target: "es2018",
	logLevel: "info",
	sourcemap: prod ? false : "inline",
	treeShaking: true,
	outfile: prod ? "main.js" : pluginJavaScriptFilePath,
	minify: prod
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
