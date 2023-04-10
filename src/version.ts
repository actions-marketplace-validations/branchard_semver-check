import {Version} from "./types.js";
import * as semver from "compare-versions";

export function toVersion(input: string): Version | Error {
	if (isValid(input)) {
		// Removing leading v from version
		if(input.charAt(0) === "v") {
			return input.substring(1) as Version;
		}
		return input as Version;
	}

	return Error(`Invalid version (must be semver): ${input}`);
}

export function areEquals(v1: Version, v2: Version): boolean {
	return semver.compare(v1, v2, "=");
}

export function isValid(input: string): boolean {
	return semver.validate(input);
}
