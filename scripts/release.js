import { exec as execSync } from "node:child_process";
import { promisify } from "node:util";

const version = process.env.npm_package_version;

const exec = promisify(execSync);

const commands = [
	"git push",
	`git tag -a ${version} -m "${version}"`,
	`git push origin ${version}`
]

await exec(commands.join(" && "));