const fs = require('fs');
const { Level2Radar } = require('./src/index');

// first file in series
const fileToLoad = './data/chunks/230/20210729-123848-001-S';

(async () => {
	// load file
	const data = await new Promise((resolve) => {
		fs.readFile(fileToLoad, (err, fileData) => {
			resolve(fileData);
		});
	});
	let radar;
	try {
		radar = new Level2Radar(data);
		console.log(radar);
	} catch (e) {
		console.error('Error parsing data');
		console.error(e.stack);
		return false;
	}

	try {
		const reflectivityCompressed = radar.getHighresReflectivity();
		console.log(reflectivityCompressed);
	} catch (e) {
		console.error('Error reading data');
		console.error(e.stack);
		return false;
	}
})();
