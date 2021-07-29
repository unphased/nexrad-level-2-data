const { RandomAccessFile, BIG_ENDIAN } = require('./classes/RandomAccessFile');
const { Level2Record } = require('./classes/Level2Record');
const { FILE_HEADER_SIZE, RADAR_DATA_SIZE } = require('./constants');
const decompress = require('./decompress');

class Level2Radar {
	constructor(file, options) {
		this.elevation = 0;
		this.scan = 0;
		// options and defaults
		this.options = {
			...options,
		};
		this.parseData(file);
	}

	setElevation(elevation) {
		this.elevation = elevation - 1;
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

	static decompress(raf) {
		return decompress(raf);
	}

	/**
     * Loads the file and parses the data.
     * Returns a promise when completed
     */
	parseData(file) {
		/**
             * Load and access the radar archive file.
             * The constructor for RandomAccessFile returns
             * a promise. This allows for parsing the data
             * after the file has been fully loaded into the
             * buffer.
             */
		const rafCompressed = new RandomAccessFile(file, BIG_ENDIAN);
		const data = [];

		// decompress file if necessary, returns original file if no compression exists
		const raf = Level2Radar.decompress(rafCompressed);

		// read the file header
		const header = {};
		// fixed at AR2V00
		raf.skip('AR2V00'.length);
		header.version = raf.readString(2);
		raf.skip('.001'.length);
		header.modified_julian_date = raf.readInt();
		header.milliseconds = raf.readInt();
		header.ICAO = raf.readString(4);
		// start over to grab the raw header
		raf.seek(0);
		header.raw = raf.read(FILE_HEADER_SIZE);
		this.header = header;

		let messageOffset31 = 0; // the current message 31 offset
		let recordNumber = 0; // the record number

		/**
					 * Loop through all of the messages
					 * contained within the radar archive file.
					 * Save all the data we find to it's respective array
					 */
		let r;
		do {
			try {
				r = new Level2Record(raf, recordNumber, messageOffset31, header, this.options);
				recordNumber += 1;
			} catch (e) {
				// parsing error, report error then set this chunk as finished
				console.error(e);
				r = { finished: true };
			}

			if (!r.finished) {
				if (r.message_type === 31) {
					// found a message 31 type, update the offset using an actual (from search) size if provided
					const messageSize = r.actual_size ?? r.message_size;
					messageOffset31 += (messageSize * 2 + 12 - RADAR_DATA_SIZE);
				}

				// only process specific message types
				if ([1, 5, 7, 31].includes(r.message_type)) {
					// If data is found, push the record to the data array
					if (r?.record?.reflect
								|| r?.record?.velocity
								|| r?.record?.spectrum
								|| r?.record?.zdr
								|| r?.record?.phi
								|| r?.record?.rho) data.push(r);

					if ([5, 7].includes(r.message_type)) this.vcp = r;
				}
			}
		} while (!r.finished);

		// sort and group the scans by elevation asc
		this.data = Level2Radar.groupAndSortScans(data);
	}

	/**
     * This takes the scans (aka sweeps) and groups them
     * by their elevation numbers. This allows switching
     * between different elevations, if available.
     */
	static groupAndSortScans(scans) {
		const groups = [];

		// map the scans
		scans.forEach((scan) => {
			const { elevation_number: elevationNumber } = scan.record;

			/**
             * If the group has already been created
             * just push the current scan into the array
             * or create a new group for the elevation
             */
			if (groups[elevationNumber]) {
				groups[elevationNumber].push(scan);
			} else {
				groups[elevationNumber] = [scan];
			}
		});

		// Sort by elevation number ascending
		return groups.sort((a, b) => {
			const aElev = a[0].record.elevation_number;
			const bElev = b[0].record.elevation_number;

			if (aElev > bElev) return 1;
			if (aElev < bElev) return -1;
			return 0;
		});
	}

	_checkData() {
		if (this.data.length === 0) throw new Error('No data found in file');
	}
}

module.exports.Level2Radar = Level2Radar;
