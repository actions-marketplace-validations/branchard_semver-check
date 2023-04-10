import {
	getInput,
	setFailed,
	info,
	error,
	warning,
	setOutput,
	startGroup,
	endGroup
} from "@actions/core";
import * as npm from "./npm";
import * as git from "./git";
import {Infos} from "./types";

const availableSources = ["package.json"] as const;
const availableDestinations = ["npm", "git"] as const;

type Source = typeof availableSources[number]
type Destination = typeof availableDestinations[number]

async function main() {
	const source = getSource();
	if (source instanceof Error) {
		return setFailed(source.message)
	}

	const destination = getDestination();
	if (destination instanceof Error) {
		return setFailed(destination.message)
	}

	const sourceInfos = await getInfosFromSource(source);
	if (sourceInfos instanceof Error) {
		return setFailed(sourceInfos.message)
	}

	const isAvailable = await checkAvailability(sourceInfos, destination);
	if (isAvailable instanceof Error) {
		return setFailed(isAvailable.message)
	}

	return setOutput("available", isAvailable);
}

async function getInfosFromSource(source: Source): Promise<Infos | Error> {
	switch (source) {
		case "package.json":
			return await npm.getInfos();
		default:
			return Error(`Unknown source: ${source}`);
	}
}

async function checkAvailability(sourceInfos: Infos, destination: Destination): Promise<boolean | Error> {
	switch (destination) {
		case "npm":
			return npm.checkAvailability(sourceInfos);
		case "git":
			return git.checkAvailability(sourceInfos);
		default:
			return Error(`Unknown destination: ${destination}`);
	}
}

function getSource(): Source | Error {
	const sourceFromInput = getInput("source");
	if(availableSources.includes(sourceFromInput as Source)) {
		return sourceFromInput as Source;
	}

	return Error(`Unknown source: ${sourceFromInput}`);
}

function getDestination(): Destination | Error {
	const destinationFromInput = getInput("destination");
	if(availableDestinations.includes(destinationFromInput as Destination)) {
		return destinationFromInput as Destination;
	}

	return Error(`Unknown destination: ${destinationFromInput}`);
}

main();

