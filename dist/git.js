import { $ } from 'execa';
import * as version from "./version.js";
export async function checkAvailability(sourceInfos) {
    const tags = await getTags();
    if (tags instanceof Error) {
        return tags;
    }
    const versions = tagsToVersions(tags);
    if (versions instanceof Error) {
        return versions;
    }
    return versions.every(ver => !version.areEquals(sourceInfos.version, ver));
}
async function getTags() {
    const process = await $ `git --no-pager tag`;
    if (process.exitCode !== 0) {
        return Error(`Unable to get git tags: ${process.stderr}`);
    }
    return process.stdout.split("\n");
}
function tagsToVersions(tags) {
    let versions = [];
    for (const tag of tags.filter(tag => version.isValid(tag))) {
        const ver = version.toVersion(tag);
        if (ver instanceof Error) {
            return ver;
        }
        versions.push(ver);
    }
    return versions;
}
