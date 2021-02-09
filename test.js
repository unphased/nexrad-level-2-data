const { Level2Radar } = require('./index');

const fileToLoad = 'KTLX20130420_205120_V06'; // The radar archive file to load

Math.radians = (degrees) => degrees * Math.PI / 180;

new Level2Radar(fileToLoad).then((radar) => {
	// console.log(radar.getHighresReflectivity())
	const reflectivity = radar.getHighresReflectivity();
	const azimuth = radar.getAzimuth();

	console.log(reflectivity);
	console.log(azimuth);
});
