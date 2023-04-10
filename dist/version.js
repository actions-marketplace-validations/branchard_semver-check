import * as semver from "compare-versions";
export function toVersion(input) {
    if (isValid(input)) {
        // Removing leading v from version
        if (input.charAt(0) === "v") {
            return input.substring(1);
        }
        return input;
    }
    return Error(`Invalid version (must be semver): ${input}`);
}
export function areEquals(v1, v2) {
    return semver.compare(v1, v2, "=");
}
export function isValid(input) {
    return semver.validate(input);
}
