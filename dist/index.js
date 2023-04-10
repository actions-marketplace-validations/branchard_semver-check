// src/index.ts
import {
  getInput,
  setFailed,
  setOutput
} from "@actions/core";

// src/npm.ts
import { info } from "@actions/core";
import { readFile } from "fs/promises";
import axios from "axios";

// src/version.ts
import * as semver from "compare-versions";
function toVersion(input) {
  if (isValid(input)) {
    if (input.charAt(0) === "v") {
      return input.substring(1);
    }
    return input;
  }
  return Error(`Invalid version (must be semver): ${input}`);
}
function areEquals(v1, v2) {
  return semver.compare(v1, v2, "=");
}
function isValid(input) {
  return semver.validate(input);
}

// src/utils.ts
import { stat } from "fs/promises";
async function toFilePath(path) {
  try {
    const stats = await stat(path);
    if (stats.isFile()) {
      return path;
    }
    return Error(`${path} is not a file`);
  } catch (e) {
    return Error(`Unable find the file: ${path}`);
  }
}

// src/npm.ts
async function getInfos() {
  const path = await toFilePath("./package.json");
  if (path instanceof Error) {
    return path;
  }
  const packageDotJson = await getPackageDotJson(path);
  if (packageDotJson instanceof Error) {
    return packageDotJson;
  }
  info(`Getting package name from ${path}...`);
  const name = await getProjectName(packageDotJson);
  if (name instanceof Error) {
    return name;
  }
  info(`Got package name: ${name}.`);
  info(`Getting source version from ${path}...`);
  const version = await getVersion(packageDotJson);
  if (version instanceof Error) {
    return version;
  }
  info(`Got source version: ${version}.`);
  return {
    name,
    version
  };
}
async function checkAvailability(sourceInfos) {
  const url = `https://registry.npmjs.org/${sourceInfos.name}/${sourceInfos.version}`;
  info(`Checking package availability on "${url}"...`);
  try {
    const response = await axios.get(url, {
      timeout: 5e3
    });
    info(`"${url}" responded HTTP ${response.status}.`);
    return response.status === 200;
  } catch (e) {
    return Error(`https://registry.npmjs.org timeout, the package name "${sourceInfos.name}" maybe not found on npmjs.org`);
  }
}
function isPackageDotJson(input) {
  return typeof input === "object";
}
async function getPackageDotJson(path) {
  try {
    const data = await readFile(path);
    const json = JSON.parse(data.toString());
    if (isPackageDotJson(json)) {
      return json;
    }
  } catch (e) {
  }
  return Error(`Unable to find package.json at: ${path}`);
}
async function getVersion(packageDotJson) {
  if (packageDotJson.version) {
    return toVersion(packageDotJson.version);
  }
  return Error("Unable to find version field in package.json");
}
async function getProjectName(packageDotJson) {
  if (packageDotJson.name) {
    return packageDotJson.name;
  }
  return Error("Unable to find name field in package.json");
}

// src/git.ts
import { $ } from "execa";
async function checkAvailability2(sourceInfos) {
  const tags = await getTags();
  if (tags instanceof Error) {
    return tags;
  }
  const versions = tagsToVersions(tags);
  if (versions instanceof Error) {
    return versions;
  }
  return versions.every((ver) => !areEquals(sourceInfos.version, ver));
}
async function getTags() {
  const process = await $`git --no-pager tag`;
  if (process.exitCode !== 0) {
    return Error(`Unable to get git tags: ${process.stderr}`);
  }
  return process.stdout.split("\n");
}
function tagsToVersions(tags) {
  let versions = [];
  for (const tag of tags.filter((tag2) => isValid(tag2))) {
    const ver = toVersion(tag);
    if (ver instanceof Error) {
      return ver;
    }
    versions.push(ver);
  }
  return versions;
}

// src/index.ts
var availableSources = ["package.json"];
var availableDestinations = ["npm", "git"];
async function main() {
  const source = getSource();
  if (source instanceof Error) {
    return setFailed(source.message);
  }
  const destination = getDestination();
  if (destination instanceof Error) {
    return setFailed(destination.message);
  }
  const sourceInfos = await getInfosFromSource(source);
  if (sourceInfos instanceof Error) {
    return setFailed(sourceInfos.message);
  }
  const isAvailable = await checkAvailability3(sourceInfos, destination);
  if (isAvailable instanceof Error) {
    return setFailed(isAvailable.message);
  }
  return setOutput("available", isAvailable);
}
async function getInfosFromSource(source) {
  switch (source) {
    case "package.json":
      return await getInfos();
    default:
      return Error(`Unknown source: ${source}`);
  }
}
async function checkAvailability3(sourceInfos, destination) {
  switch (destination) {
    case "npm":
      return checkAvailability(sourceInfos);
    case "git":
      return checkAvailability2(sourceInfos);
    default:
      return Error(`Unknown destination: ${destination}`);
  }
}
function getSource() {
  const sourceFromInput = getInput("source");
  if (availableSources.includes(sourceFromInput)) {
    return sourceFromInput;
  }
  return Error(`Unknown source: ${sourceFromInput}`);
}
function getDestination() {
  const destinationFromInput = getInput("destination");
  if (availableDestinations.includes(destinationFromInput)) {
    return destinationFromInput;
  }
  return Error(`Unknown destination: ${destinationFromInput}`);
}
main();
