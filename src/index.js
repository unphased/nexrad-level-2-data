const parseData = require('./parsedata');

class Level2Radar {
	constructor(file, options) {
		this.elevation = 1;	// 1 based per NOAA documentation
		this.scan = 0;
		// options and defaults
		this.options = {
			...options,
		};
		const { data, header, vcp } = parseData(file, options);
		this.data = data;
		this.header = header;
		this.vcp = vcp;
	}

	setElevation(elevation) {
		this.elevation = elevation;
	}

	setScan(scan) {
		this.scan = scan - 1;
	}

	setSweep(sweep) {
		this.setScan(sweep);
	}

	getAzimuth(scan) {
		// error checking
		if (scan === undefined) throw new Error('getAzimuth scan parameter not provided');
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getAzimuth invalid elevation selected: ${this.elevation}`);
		if (this?.data?.[this.elevation]?.[scan] === undefined) throw new Error(`getAzimuth invalid scan selected: ${scan}`);
		if (this?.data?.[this.elevation]?.[scan]?.record?.azimuth === undefined) throw new Error(`getAzimuth no data for elevation: ${this.elevation}, scan: ${scan}`);

		// return data
		return this.data[this.elevation][scan].record.azimuth;
	}

	getScans() {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getScans no data for elevation: ${this.elevation}`);
		return this.data[this.elevation].length;
	}

	// return reflectivity data for the current elevation and scan
	getHighresReflectivity(scan) {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresReflectivity invalid elevation selected: ${this.elevation}`);

		if (scan !== undefined) {
			// error checking
			if (this?.data?.[this.elevation]?.[scan] === undefined) throw new Error(`getHighresReflectivity invalid scan selected: ${scan}`);
			if (this?.data?.[this.elevation]?.[scan]?.record?.reflect === undefined) throw new Error(`getHighresReflectivity no data for elevation: ${this.elevation}, scan: ${scan}`);
			// return data
			return this.data[this.elevation][scan].record.reflect;
		}
		return this.data[this.elevation].map((elev) => elev.record.reflect);
	}

	// return message_header information
	getHeader() {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHeader invalid elevation selected: ${this.elevation}`);
		if (this?.data?.[this.elevation]?.[this.scan] === undefined) throw new Error(`getHeader invalid scan selected: ${this.scan}`);
		if (this?.data?.[this.elevation]?.[this.scan]?.record === undefined) throw new Error(`getHeader no data for elevation: ${this.elevation}, scan: ${this.scan}`);

		// return data
		return this.data[this.elevation][this.scan].record;
	}

	// return velocity data for the current elevation and scan
	getHighresVelocity(scan) {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresVelocity invalid elevation selected: ${this.elevation}`);

		if (scan !== undefined) {
			// error checking
			if (this?.data?.[this.elevation]?.[scan] === undefined) throw new Error(`getHighresVelocity invalid scan selected: ${scan}`);
			if (this?.data?.[this.elevation]?.[scan]?.record?.reflect === undefined) throw new Error(`getHighresVelocity no data for elevation: ${this.elevation}, scan: ${scan}`);

			// return data
			return this.data[this.elevation][scan].record.velocity;
		}
		return this.data[this.elevation].map((elev) => elev.record.velocity);
	}

	// return spectrum data for the current elevation and scan
	getHighresSpectrum() {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresSpectrum invalid elevation selected: ${this.elevation}`);
		if (this?.data?.[this.elevation]?.[this.scan] === undefined) throw new Error(`getHighresSpectrum invalid scan selected: ${this.scan}`);
		if (this?.data?.[this.elevation]?.[this.scan]?.record?.spectrum === undefined) throw new Error(`getHighresSpectrum no data for elevation: ${this.elevation}, scan: ${this.scan}`);

		// return data
		return this.data[this.elevation][this.scan].record.spectrum;
	}

	// return diff reflectivity data for the current elevation and scan
	getHighresDiffReflectivity() {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresDiffReflectivity invalid elevation selected: ${this.elevation}`);
		if (this?.data?.[this.elevation]?.[this.scan] === undefined) throw new Error(`getHighresDiffReflectivity invalid scan selected: ${this.scan}`);
		if (this?.data?.[this.elevation]?.[this.scan]?.record?.zdr === undefined) throw new Error(`getHighresDiffReflectivity no data for elevation: ${this.elevation}, scan: ${this.scan}`);

		// return data
		return this.data[this.elevation][this.scan].record.zdr;
	}

	// return diff phase data for the current elevation and scan
	getHighresDiffPhase() {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresDiffPhase invalid elevation selected: ${this.elevation}`);
		if (this?.data?.[this.elevation]?.[this.scan] === undefined) throw new Error(`getHighresDiffPhase invalid scan selected: ${this.scan}`);
		if (this?.data?.[this.elevation]?.[this.scan]?.record?.phi === undefined) throw new Error(`getHighresDiffPhase no data for elevation: ${this.elevation}, scan: ${this.scan}`);

		// return data
		return this.data[this.elevation][this.scan].record.phi;
	}

	// return correlation coefficient data for the current elevation and scan
	getHighresCorrelationCoefficient() {
		// error checking
		this._checkData();
		if (this?.data?.[this.elevation] === undefined) throw new Error(`getHighresCorrelationCoefficient invalid elevation selected: ${this.elevation}`);
		if (this?.data?.[this.elevation]?.[this.scan] === undefined) throw new Error(`getHighresCorrelationCoefficient invalid scan selected: ${this.scan}`);
		if (this?.data?.[this.elevation]?.[this.scan]?.record?.rho === undefined) throw new Error(`getHighresCorrelationCoefficient no data for elevation: ${this.elevation}, scan: ${this.scan}`);

		// return data
		return this.data[this.elevation][this.scan].record.rho;
	}

	listElevations() {
		return Object.keys(this.data).map((key) => +key);
	}

	_checkData() {
		if (this.data.length === 0) throw new Error('No data found in file');
	}
}

module.exports.Level2Radar = Level2Radar;
