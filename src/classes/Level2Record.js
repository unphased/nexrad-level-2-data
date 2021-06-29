const {
	FILE_HEADER_SIZE, RADAR_DATA_SIZE, CTM_HEADER_SIZE,
} = require('../constants');

// message parsers
const parseMessage1 = require('./Level2Record-1');
const parseMessage31 = require('./Level2Record-31');
const parseMessage5 = require('./Level2Record-5-7');
/**
 * Returns a record from the loaded radar data
 */
class Level2Record {
	constructor(raf, record, message31Offset, options) {
		this._record_offset = record * RADAR_DATA_SIZE + FILE_HEADER_SIZE + message31Offset;
		this.options = options;

		// passed the buffer, finished reading the file
		if (this._record_offset >= raf.getLength()) return { finished: true };

		// return the current record data
		return this.getRecord(raf);
	}

	getRecord(raf) {
		raf.seek(this._record_offset);
		raf.skip(CTM_HEADER_SIZE);

		const message = {
			message_size: raf.readShort(),
			channel: raf.readByte(),
			message_type: raf.readByte(),
			id_sequence: raf.readShort(),
			message_julian_date: raf.readShort(),
			message_mseconds: raf.readInt(),
			segment_count: raf.readShort(),
			segment_number: raf.readShort(),
		};

		switch (message.message_type) {
		case 31: return parseMessage31(raf, message, this._record_offset, this.options);
		case 1: return parseMessage1(raf, message);
		case 5:
		case 7: return parseMessage5(raf, message);
		default: return false;
		}
	}
}

module.exports.Level2Record = Level2Record;
