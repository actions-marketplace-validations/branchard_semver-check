import {$} from 'execa';
import {Alias, Infos, Version} from "./types.js";
import * as version from "./version.js";

type GitTag = Alias<string>;

export async function checkAvailability(sourceInfos: Infos): Promise<boolean | Error> {
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

async function getTags(): Promise<GitTag[] | Error> {
	const process = await $`git --no-pager tag`;
	if (process.exitCode !== 0) {
		return Error(`Unable to get git tags: ${process.stderr}`);
	}

	return process.stdout.split("\n") as GitTag[];
}

function tagsToVersions(tags: GitTag[]): Version[] | Error {
	let versions: Version[] = [];
	for (const tag of tags.filter(tag => version.isValid(tag))) {
		const ver = version.toVersion(tag);
		if (ver instanceof Error) {
			return ver;
		}
		versions.push(ver);
	}
	return versions;
}


