import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pluginDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputDirectory = path.resolve(pluginDirectory, "../dist");
const iconSource = path.resolve(pluginDirectory, "../public/assets/icon.svg");
const iconOutput = path.join(outputDirectory, "assets", "icon.svg");

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(path.dirname(iconOutput), { recursive: true });
await cp(iconSource, iconOutput);
