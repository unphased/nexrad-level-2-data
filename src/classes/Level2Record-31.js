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
	console.log(offset);
	const parser = new Level2Parser(raf, dataBlockPointer, offset);
	return {
		block_type: parser.getDataBlockString(1),
		name: parser.getDataBlockString(3),
		size: parser.getDataBlockShort(),
		version_major: parser.getDataBlockByte(),
		version_minor: parser.getDataBlockByte(),
		latitude: parser.getDataBlockFloat(),
		longitude: parser.getDataBlockFloat(),
		elevation: parser.getDataBlockShort(),
		feedhorn_height: parser.getDataBlockShort(),
		calibration: parser.getDataBlockFloat(),
		tx_horizontal: parser.getDataBlockFloat(),
		tx_vertical: parser.getDataBlockFloat(),
		differential_reflectivity: parser.getDataBlockFloat(),
		differential_phase: parser.getDataBlockFloat(),
		volume_coverage_pattern: parser.getDataBlockShort(),
		spare: parser.getDataBlockShort(),
	};
};

/**
	 * Creates a new parser and grabs the data
	 * from the data blocks. Then save that data
	 * to the record.elevation Object
	 * See page 114; Section "Data Block #2" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
	 */
const parseElevationData = (raf, dataBlockPointer, offset) => {
	const parser = new Level2Parser(raf, dataBlockPointer, offset);
	return {
		block_type: parser.getDataBlockString(1),
		name: parser.getDataBlockString(3),
		size: parser.getDataBlockShort(),
		atmos: parser.getDataBlockShort(),
		calibration: parser.getDataBlockFloat(),
	};
};

/**
	 * Creates a new parser and grabs the data
	 * from the data blocks. Then save that data
	 * to the record.radial Object
	 * See page 115; Section "Data Block #3" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
	 */
const parseRadialData = (raf, dataBlockPointer, offset) => {
	const parser = new Level2Parser(raf, dataBlockPointer, offset);
	return {
		block_type: parser.getDataBlockString(1),
		name: parser.getDataBlockString(3),
		size: parser.getDataBlockShort(),
		unambiguous_range: parser.getDataBlockShort() / 10,
		horizontal_noise_level: parser.getDataBlockFloat(),
		vertical_noise_level: parser.getDataBlockFloat(),
		nyquist_velocity: parser.getDataBlockShort(),
		radial_flags: parser.getDataBlockShort(),
		horizontal_calibration: parser.getDataBlockFloat(),
		vertical_calibration: parser.getDataBlockFloat(),
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
	// initial offset for moment data
	const data = {
		block_type: parser.getDataBlockString(1),
		name: parser.getDataBlockString(3),
		spare: parser.getDataBlockBytes(4),
		gate_count: parser.getDataBlockShort(),
		first_gate: parser.getDataBlockShort() / 1000, // scale int to float 0.001 precision
		gate_size: parser.getDataBlockShort() / 1000, // scale int to float 0.001 precision
		rf_threshold: parser.getDataBlockShort() / 10, // scale int to float 0.1 precision
		snr_threshold: parser.getDataBlockShort() / 1000, // scale int to float 0.001 precision
		control_flags: parser.getDataBlockByte(),
		data_size: parser.getDataBlockByte(),
		scale: parser.getDataBlockFloat(),
		offset: parser.getDataBlockFloat(),
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

	parser.seek(MESSAGE_HEADER_SIZE);
	for (let i = MESSAGE_HEADER_SIZE; i <= endI; i += inc) {
		const val = getDataBlock();
		// per documentation 0 = below threshold, 1 = range folding
		if (val >= 2) {
			data.moment_data.push((val - data.offset) / data.scale);
		} else {
			data.moment_data.push(null);
		}
	}

	return data;
};
