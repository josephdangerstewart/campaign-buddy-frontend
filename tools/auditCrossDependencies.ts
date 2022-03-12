import { cruise } from 'dependency-cruiser';
import path from 'path';
import fs from 'fs';

const allPackageFolderNames = getAllLocalPackages();
const allPackageNames = allPackageFolderNames.map(
	(x) => `@campaign-buddy/${x}`
);

for (const packageName of allPackageFolderNames) {
	validateAllCrossPackageDeps(packageName);
}

function validateAllCrossPackageDeps(packageName: string) {
	const packageSrcDir = path.join('./packages/', packageName, 'src');
	const result = cruise([packageSrcDir]);

	const packageJson = readPackageJson(packageName);
	const tsConfig = readTsConfig(packageName);

	const allDependencies = [
		...Object.keys(packageJson.dependencies ?? {}),
		...Object.keys(packageJson.devDependencies ?? {}),
	].filter((x) => allPackageNames.includes(x));

	const tsConfigReferences =
		tsConfig.references
			?.map((x: any) => x.path.split('/')[1])
			.map((x: string) => `@campaign-buddy/${x}`) ?? [];

	if (!allDependencies.every((x) => tsConfigReferences.includes(x))) {
		console.error(allDependencies, tsConfigReferences);
		throw new Error(
			`expected tsConfigReferences to contain every dependency from package.json in packages/${packageName}`
		);
	}

	if (result.exitCode !== 0) {
		console.error(result.output);
		throw new Error('dependency-cruiser returned a non-0 exit code');
	}

	if (typeof result.output === 'string') {
		console.error(result.output);
		throw new Error('dependency-cruiser returned unexpected output');
	}

	for (const module of result.output.modules) {
		if (!module.source.startsWith(`packages/${packageName}`)) {
			continue;
		}

		for (const moduleDep of module.dependencies) {
			if (moduleDep.module.startsWith('@campaign-buddy')) {
				if (!allDependencies.includes(moduleDep.module)) {
					throw new Error(
						`detected unlisted local module reference (to ${moduleDep.module}) in ${module.source}`
					);
				}
			} else if (moduleDep.resolved.startsWith('packages')) {
				if (moduleDep.resolved.startsWith(`packages/${packageName}`)) {
					continue;
				} else {
					throw new Error(
						`detected package reference via relative import (to ${moduleDep.module}) in ${module.source}`
					);
				}
			}
		}
	}
}

function getAllLocalPackages() {
	const packageFolders = fs.readdirSync(path.join('./packages/'));

	const allPackageNames: string[] = [];

	for (const packageFolder of packageFolders) {
		const packageJson = readPackageJson(packageFolder);

		if (packageJson.name !== `@campaign-buddy/${packageFolder}`) {
			throw new Error(
				`Package.json name must match folder name. Expected @campaign-buddy/${packageFolder} but got ${packageJson.name}`
			);
		}

		allPackageNames.push(packageFolder);
	}

	return allPackageNames;
}

function readPackageJson(packageName: string): any {
	const packageJsonRaw = fs.readFileSync(
		path.join('./packages/', packageName, '/package.json'),
		{ encoding: 'utf-8' }
	);

	try {
		return JSON.parse(packageJsonRaw);
	} catch {
		throw new Error(`could not parse package.json in packages/${packageName}`);
	}
}

function readTsConfig(packageName: string): any {
	const tsConfigRaw = fs.readFileSync(
		path.join('./packages/', packageName, '/tsconfig.json'),
		{ encoding: 'utf-8' }
	);

	try {
		return JSON.parse(tsConfigRaw);
	} catch {
		throw new Error(`could not parse tsconfig in packages/${packageName}`);
	}
}
