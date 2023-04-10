"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// export async function test() {
// 	const {repository} = await graphql<{ repository: Repository }>(
// 		`
// 		{
// 		  repository(owner: "octokit", name: "graphql.js") {
// 			issues(last: 3) {
// 			  edges {
// 				node {
// 				  title
// 				}
// 			  }
// 			}
// 		  }
// 		}
// 	  `,
// 		{
// 			headers: {
// 				authorization: `token secret123`,
// 			},
// 		}
// 	);
// }
// export async function getVersion(packageDotJson: PackageDotJson): Promise<O<SemVer>> {
// 	if(packageDotJson.version) {
// 		const version = semver.coerce(packageDotJson.version);
// 		if(version) {
// 			return O.Some(version);
// 		}
// 	}
//
// 	return O.None;
// }
//
// export async function getProjectName(packageDotJson: PackageDotJson): Promise<O<ProjectName>> {
// 	if(packageDotJson.name) {
// 		return packageDotJson.name as ProjectName;
// 	}
// }
//
// export async function getPackageDotJson(path: FilePath): Promise<O<PackageDotJson>> {
// 	try {
// 		const data = await readFile(path);
// 		const json = JSON.parse(data.toString()) as object;
//
// 		if(isPackageDotJson(json)) {
// 			return O.Some(json);
// 		}
// 	} catch (e) {
//
// 	}
//
// 	return O.None;
// }
