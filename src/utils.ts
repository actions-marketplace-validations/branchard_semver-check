import {stat} from "node:fs/promises";
import {FilePath} from "./types";

export async function toFilePath(path: string): Promise<FilePath | Error> {
	try {
		const stats = await stat(path);
		if (stats.isFile()) {
			return path as FilePath;
		}

		return Error(`${path} is not a file`);
	} catch (e) {
		return Error(`Unable find the file: ${path}`);
	}
}
