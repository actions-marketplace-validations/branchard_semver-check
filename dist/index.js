import { getInput, setFailed, setOutput } from "@actions/core";
import * as npm from "./npm.js";
import * as git from "./git.js";
const availableSources = ["package.json"];
const availableDestinations = ["npm", "git"];
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
    const isAvailable = await checkAvailability(sourceInfos, destination);
    if (isAvailable instanceof Error) {
        return setFailed(isAvailable.message);
    }
    return setOutput("available", isAvailable);
}
async function getInfosFromSource(source) {
    switch (source) {
        case "package.json":
            return await npm.getInfos();
        default:
            return Error(`Unknown source: ${source}`);
    }
}
async function checkAvailability(sourceInfos, destination) {
    switch (destination) {
        case "npm":
            return npm.checkAvailability(sourceInfos);
        case "git":
            return git.checkAvailability(sourceInfos);
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
