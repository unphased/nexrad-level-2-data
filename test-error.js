const fs = require('fs');
const { Level2Radar } = require('./src/index');

const fileToLoadError = './data/messagesizeerror';

(async () => {
	// load file
	const dataError = await new Promise((resolve) => {
		fs.readFile(fileToLoadError, (err, fileData) => {
			resolve(fileData);
		});
	});
	const radarError = new Level2Radar(dataError);
	console.log(radarError);

	const reflectivityCompressed = radarError.getHighresReflectivity();
	console.log(reflectivityCompressed);
})();
