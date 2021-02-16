const { Level2Parser } = require('./Level2Parser');
const { MESSAGE_HEADER_SIZE } = require('../constants');
// parse message type 31
module.exports = (raf, message, offset, options) => {
	message.record = {
		id: raf.readString(4),
		mseconds: raf.readInt(),
		julian_date: raf.readShort(),
		radial_number: raf.readShort(),
		azimuth: raf.readFloat(),
		compress_idx: raf.readByte(),
		sp: raf.readByte(),
		radial_length: raf.readShort(),
		ars: raf.readByte(),
		rs: raf.readByte(),
		elevation_number: raf.readByte(),
		cut: raf.readByte(),
		elevation_angle: raf.readFloat(),
		rsbs: raf.readByte(),
		aim: raf.readByte(),
		dcount: raf.readShort(),
	};

	/**
	 * Read and save the data pointers from the file
	 * so we know where to start reading within the file
	 * to grab the data from the data blocks
	 * See page 114 of https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
	 */
	const dbp = [];
	for (let i = 0; i < 9; i += 1) {
		const pointer = raf.readInt();
		if (i < message.record.dcount) dbp.push(pointer);
	}

	/**
	 * Parse all of our data inside the datablocks
	 * and save it to the message.record Object
	 */
	// first three blocks are always present
	message.record.volume = parseVolumeData(raf, dbp[0], offset);
	message.record.elevation = parseElevationData(raf, dbp[1], offset);
	message.record.radial = parseRadialData(raf, dbp[2], offset);

	// block types in the order they are stored as data block pointers
	const blockTypes = ['VOL', 'ELE', 'RAD', 'REF', 'VEL', 'SW', 'ZDR', 'PHI', 'RHO'];

	// block type to friendly name conversion
	const blockTypesFriendly = {
		VOL: '',
		ELE: '',
		RAD: '',
		REF: 'reflect',
		VEL: 'velocity',
		SW: 'spectrum',
		ZDR: 'zdr',
		PHI: 'phi',
		RHO: 'rho',
	};

	// process remaining blocks if requested and if present
	for (let i = 3; i < dbp.length; i += 1) {
		if (options.parseTypes.includes(blockTypes[i]) && dbp[i] < message.message_size) {
			message.record[blockTypesFriendly[blockTypes[i]]] = parseMomentData(raf, dbp[i], offset, message.message_size);
		}
	}
	return message;
};

/**
 * Creates a new parser and grabs the data
 * from the data blocks. Then save that data
 * to the record.volume Object
 * See page 114; Section "Data Block #1" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
 */
const parseVolumeData = (raf, dataBlockPointer, offset) => {
	const parser = new Level2Parser(raf, dataBlockPointer, offset);
	return {
		block_type: parser.getDataBlockString(0, 1),
		name: parser.getDataBlockString(1, 3),
		size: parser.getDataBlockShort(4),
		version_major: parser.getDataBlockByte(6),
		version_minor: parser.getDataBlockByte(7),
		latitude: parser.getDataBlockFloat(8),
		longitude: parser.getDataBlockFloat(12),
		elevation: parser.getDataBlockShort(16),
		feedhorn_height: parser.getDataBlockByte(18),
		calibration: parser.getDataBlockFloat(20),
		tx_horizontal: parser.getDataBlockFloat(24),
		tx_vertical: parser.getDataBlockFloat(28),
		differential_reflectivity: parser.getDataBlockFloat(32),
		volume_coverage_pattern: parser.getDataBlockShort(40),
	};
};

/**
	 * Creates a new parser and grabs the data
	 * from the data blocks. Then save that data
	 * to the record.elevation Object
	 * See page 114; Section "Data Block #2" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
	 */
const parseElevationData = (raf, record, dataBlockPointer, offset) => {
	const parser = new Level2Parser(raf, dataBlockPointer, offset);
	return {
		block_type: parser.getDataBlockString(0, 1),
		name: parser.getDataBlockString(1, 3),
		size: parser.getDataBlockShort(4),
		atmos: parser.getDataBlockShort(6),
		calibration: parser.getDataBlockFloat(8),
	};
};

/**
	 * Creates a new parser and grabs the data
	 * from the data blocks. Then save that data
	 * to the record.radial Object
	 * See page 115; Section "Data Block #3" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
	 */
const parseRadialData = (raf, record, dataBlockPointer, offset) => {
	const parser = new Level2Parser(raf, dataBlockPointer, offset);
	return {
		block_type: parser.getDataBlockString(0, 1),
		name: parser.getDataBlockString(1, 3),
		size: parser.getDataBlockShort(4),
		unambiguous_range: parser.getDataBlockShort(6),
		horizontal_noise_level: parser.getDataBlockFloat(8),
		vertical_noise_level: parser.getDataBlockFloat(12),
		nyquist_velocity: parser.getDataBlockShort(16),
	};
};

/**
	 * Creates a new parser and grabs the data
	 * from the data blocks. Then save that data
	 * to the record.(reflect|velocity|spectrum|zdr|phi|rho)
	 * Object base on what type being parsed
	 * See page 115-117; Section "Data Block #4-9" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
	 */
const parseMomentData = (raf, dataBlockPointer, offset, maxSize) => {
	const parser = new Level2Parser(raf, dataBlockPointer, offset);
	const data = {
		gate_count: parser.getDataBlockShort(8),
		first_gate: parser.getDataBlockShort(10) / 1000, // scale int to float 0.001 precision
		gate_size: parser.getDataBlockShort(12) / 1000, // scale int to float 0.001 precision
		rf_threshold: parser.getDataBlockShort(14) / 10, // scale int to float 0.1 precision
		snr_threshold: parser.getDataBlockShort(16) / 1000, // scale int to float 0.001 precision
		data_size: parser.getDataBlockByte(19),
		scale: parser.getDataBlockFloat(20),
		offset: parser.getDataBlockFloat(24),
		data_offset: dataBlockPointer + MESSAGE_HEADER_SIZE,
		moment_data: [],
	};

	// allow for different sized data blocks
	let getDataBlock = parser.getDataBlockByte.bind(parser);
	let inc = 1;
	if (data.data_size === 16) {
		getDataBlock = parser.getDataBlockShort.bind(parser);
		inc = 2;
	}

	const endI = Math.min(MESSAGE_HEADER_SIZE + data.gate_count * inc, maxSize);

	for (let i = MESSAGE_HEADER_SIZE; i <= endI; i += inc) {
		const val = getDataBlock(i);
		// per documentation 0 = below threshold, 1 = range folding
		if (val >= 2) {
			data.moment_data.push((val - data.offset) / data.scale);
		} else {
			data.moment_data.push(null);
		}
	}

	return data;
};
