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

function publishProjects(dir) {
	const projectPaths = findPackageJson(dir);
	if (projectPaths.length > 0) {
		projectPaths.forEach(projectPath => {
			console.log(`Publishing ${projectPath}...`);
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