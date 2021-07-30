const fs = require('fs');
const glob = require('glob');
const { Level2Radar } = require('./src');

// const files = [
// 	// './data/chunks/230/20210729-123848-001-S',
// 	'./data/chunks/230/20210729-123848-002-I',
// ];

const files = glob.sync('./data/chunks/230/*');

files.forEach((fileToLoad) => {
	console.log(`**** ${fileToLoad}`);

	// load file
	let data;
	try {
		data = fs.readFileSync(fileToLoad);
	} catch (e) {
		console.error('Unable to read file');
		console.error(e.stack);
		return false;
	}

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
		radar.listElevations().forEach((elev) => {
			radar.setElevation(elev);
			const reflectivity = radar.getHighresReflectivity();
			console.log(reflectivity);
		});
	} catch (e) {
		console.error('Error reading data');
		console.error(e.stack);
		return false;
	}
	return true;
});
