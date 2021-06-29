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
		if (scan) {
			return this.data[this.elevation][scan].record.azimuth;
		}
		return null;
	}

	getScans() {
		return this.data[this.elevation].length;
	}

	// return reflectivity data for the current elevation and scan
	getHighresReflectivity(scan) {
		if (scan) {
			return this.data[this.elevation][scan].record.reflect;
		}
		return this.data[this.elevation].map((elev) => elev.record.reflect);
	}

	// return message_header information
	getHeader() {
		return this.data[this.elevation][this.scan].record;
	}

	// return velocity data for the current elevation and scan
	getHighresVelocity(scan) {
		if (scan) {
			return this.data[this.elevation][scan].record.velocity;
		}
		return this.data[this.elevation].map((elev) => elev.record.velocity);
	}

	// return spectrum data for the current elevation and scan
	getHighresSpectrum() {
		return this.data[this.elevation][this.scan].record.spectrum;
	}

	// return diff reflectivity data for the current elevation and scan
	getHighresDiffReflectivity() {
		return this.data[this.elevation][this.scan].record.zdr;
	}

	// return diff phase data for the current elevation and scan
	getHighresDiffPhase() {
		return this.data[this.elevation][this.scan].record.phi;
	}

	// return correlation coefficient data for the current elevation and scan
	getHighresCorrelationCoefficient() {
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
				r = new Level2Record(raf, recordNumber, messageOffset31, this.options);
				recordNumber += 1;
			} catch (e) {
				// parsing error, report error then set this chunk as finished
				console.error('Message terminated early');
				console.error(e);
				r = { finished: true };
			}

			if (!r.finished) {
				if (r.message_type === 31) {
					// found a message 31 type, update the offset
					messageOffset31 += (r.message_size * 2 + 12 - RADAR_DATA_SIZE - r.shift);
				}

				// only process specific message types
				if ([1, 5, 7, 31].includes(r.message_type)) {
					// If data is found, push the record to the data array
					if (r.record.reflect
								|| r.record.velocity
								|| r.record.spectrum
								|| r.record.zdr
								|| r.record.phi
								|| r.record.rho) data.push(r);

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
}

module.exports.Level2Radar = Level2Radar;
