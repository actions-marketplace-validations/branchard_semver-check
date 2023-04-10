import { stat } from "node:fs/promises";
export async function toFilePath(path) {
    try {
        const stats = await stat(path);
        if (stats.isFile()) {
            return path;
        }
        return Error(`${path} is not a file`);
    }
    catch (e) {
        return Error(`Unable find the file: ${path}`);
    }
}
