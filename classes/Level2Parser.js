const { MESSAGE_HEADER_SIZE } = require('../constants');

class Level2Parser {
	constructor(raf, dbp, offset) {
		this._raf = raf;
		this._dbp = dbp;
		this._record_offset = offset ?? null;

		this.offset = this._dbp + this._record_offset + MESSAGE_HEADER_SIZE;
	}

	getDataBlockByte(skip) {
		this._raf.seek(this.offset + skip);
		return this._raf.read();
	}

	getDataBlockInt(skip) {
		this._raf.seek(this.offset + skip);
		return this._raf.readInt();
	}

	getDataBlockBytes(skip, size) {
		this._raf.seek(this.offset + skip);
		return this._raf.read(size);
	}

	getDataBlockShort(skip) {
		this._raf.seek(this.offset + skip);
		return this._raf.readShort();
	}

	getDataBlockFloat(skip) {
		this._raf.seek(this.offset + skip);
		return this._raf.readFloat();
	}

	getDataBlockString(skip, size) {
		this._raf.seek(this.offset + skip);
		return this._raf.readString(size);
	}
}

module.exports.Level2Parser = Level2Parser;
