const fs = require('fs');
const { Level2Radar } = require('./src/index');

const fileToLoad = './data/KTLX20130420_205120_V06'; // The radar archive file to load
const fileToLoadCompressed = './data/KLOT20200715_230602_V06'; // The radar archive file to load
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

	// load file into buffer
	const data = await new Promise((resolve) => {
		fs.readFile(fileToLoad, (err, fileData) => {
			resolve(fileData);
		});
	});
	console.time('load-uncompressed');

	const radar = new Level2Radar(data);
	console.timeEnd('load-uncompressed');
	const reflectivity = radar.getHighresReflectivity();
	console.log(reflectivity);

	// load compressed file
	const dataCompressed = await new Promise((resolve) => {
		fs.readFile(fileToLoadCompressed, (err, fileData) => {
			resolve(fileData);
		});
	});

	console.time('load-compressed');
	// const radarCompressed = new Level2Radar(dataCompressed, { parseTypes: ['REF', 'VEL'] });
	const radarCompressed = new Level2Radar(dataCompressed);
	console.timeEnd('load-compressed');

	const reflectivityCompressed = radarCompressed.getHighresReflectivity();
	console.log(reflectivityCompressed);
})();
