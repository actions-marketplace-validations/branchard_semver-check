import {info,} from "@actions/core";
import {readFile} from 'node:fs/promises';
import axios from 'axios';
import {FilePath, Infos, ProjectName, Version} from "./types";
import * as version from './version'
import {toFilePath} from "./utils";

export async function getInfos(): Promise<Infos | Error> {
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

export async function checkAvailability(sourceInfos: Infos): Promise<boolean | Error> {
	const url = `https://registry.npmjs.org/${sourceInfos.name}/${sourceInfos.version}`;
	info(`Checking package availability on "${url}"...`);
	try {
		const response = await axios.get(url, {
			timeout: 5000,
		});
		info(`"${url}" responded HTTP ${response.status}.`);
		return response.status !== 200;
	} catch (e) {
		return Error(`https://registry.npmjs.org timeout, the package name "${sourceInfos.name}" maybe not found on npmjs.org`);
	}
}

type PackageDotJson = {
	[k: string]: any;
	version?: string;
	name?: string;
};

function isPackageDotJson(input: any): input is PackageDotJson {
	return typeof input === "object";
}

async function getPackageDotJson(path: FilePath): Promise<PackageDotJson | Error> {
	try {
		const data = await readFile(path);
		const json = JSON.parse(data.toString()) as object;

		if (isPackageDotJson(json)) {
			return json;
		}
	} catch (e) {

	}

	return Error(`Unable to find package.json at: ${path}`);
}

async function getVersion(packageDotJson: PackageDotJson): Promise<Version | Error> {
	if (packageDotJson.version) {
		return version.toVersion(packageDotJson.version);
	}

	return Error("Unable to find version field in package.json");
}

async function getProjectName(packageDotJson: PackageDotJson): Promise<ProjectName | Error> {
	if (packageDotJson.name) {
		return packageDotJson.name as ProjectName;
	}

	return Error("Unable to find name field in package.json");
}



