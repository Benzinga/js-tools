const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

function findPackageJson(dir) {
	const files = fs.readdirSync(dir);
	let packageDirs = [];
	for (const file of files) {
		const fullPath = path.join(dir, file);
		if (fs.lstatSync(fullPath).isDirectory()) {
			packageDirs = packageDirs.concat(findPackageJson(fullPath));
		} else if (file === 'package.json') {
			packageDirs.push(dir);
		}
	}
	return packageDirs;
}

const parentDir = path.resolve(__dirname, '..');
console.log(`Parent directory: ${parentDir}`);

function moveReadme(srcDir, distDir) {
	const readmeFile = 'README.md';
	const srcPath = path.join(srcDir, readmeFile);
	const distPath = path.join(distDir, readmeFile);

	if (fs.existsSync(srcPath)) {
		fs.copyFileSync(srcPath, distPath);
		console.log(`Moved ${readmeFile} from ${srcDir} to ${distDir}`);
	} else {
		console.error(`No ${readmeFile} found in ${srcDir}`);
	}
}

function publishProjects(dir) {
	const projectPaths = findPackageJson(dir);
	console.log(`Found package.json in ${projectPaths.length} directories in ${dir}`);
	if (projectPaths.length > 0) {
		projectPaths.forEach(projectPath => {
			console.log(`Publishing ${projectPath}...`);
			moveReadme(projectPath.replace(path.join(parentDir, 'dist'), parentDir), projectPath);
			exec(`npm publish`, { cwd: projectPath }, (err, stdout, stderr) => {
				if (err) {
					console.error(`Error publishing ${projectPath}: ${err.message}`);
					return;
				}
				console.log(`Published ${projectPath} successfully:\n${stdout}`);
				if (stderr) {
					console.error(`stderr: ${stderr}`);
				}
			});
		});
	} else {
		console.error(`No package.json found in ${dir}`);
	}
}

fs.readdir(distDir, (err, files) => {
	if (err) {
		console.error(`Error reading directory: ${err.message}`);
		process.exit(1);
	}

	files.forEach(file => {
		const projectPath = path.join(distDir, file);
		if (fs.lstatSync(projectPath).isDirectory()) {
			publishProjects(projectPath);
		}
	});
});