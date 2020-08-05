const { Level2Parser } = require('./Level2Parser')
const { MESSAGE_HEADER_SIZE, FILE_HEADER_SIZE, RADAR_DATA_SIZE, CTM_HEADER_SIZE } = require('../constants')


// message parsers
const parseMessage1 = require('./Level2Record-1');
const parseMessage31 = require('./Level2Record-31');
const parseMessage5 = require('./Level2Record-5-7');
/**
 * Returns a record from the loaded radar data
 */
class Level2Record {
    constructor(raf, record, message31_offset) {
        this._record_offset = record * RADAR_DATA_SIZE + FILE_HEADER_SIZE + message31_offset

        // passed the buffer, finished reading the file
        if(this._record_offset >= raf.getLength()) return { finished: true }

        // return the current record data
        return this._getRecord(raf)
    }

    /**
     * Creates a new parser and grabs the data
     * from the data blocks. Then save that data
     * to the record.volume Object
     * See page 114; Section "Data Block #1" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
     */
    _parseVolumeData(raf, record, data_block_pointer) {
        let parser = new Level2Parser(raf, data_block_pointer, this._record_offset)
        let data = {
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
            volume_coverage_pattern: parser.getDataBlockShort(40)
        }

        record.volume = data
    }

    /**
     * Creates a new parser and grabs the data
     * from the data blocks. Then save that data
     * to the record.elevation Object
     * See page 114; Section "Data Block #2" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
     */
    _parseElevationData(raf, record, data_block_pointer) {
        let parser = new Level2Parser(raf, data_block_pointer, this._record_offset)
        let data = {
            block_type: parser.getDataBlockString(0, 1),
            name: parser.getDataBlockString(1, 3),
            size: parser.getDataBlockShort(4),
            atmos: parser.getDataBlockShort(6),
            calibration: parser.getDataBlockFloat(8)
        }

        record.elevation = data
    }

    /**
     * Creates a new parser and grabs the data
     * from the data blocks. Then save that data
     * to the record.radial Object
     * See page 115; Section "Data Block #3" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
     */
    _parseRadialData(raf, record, data_block_pointer) {
        let parser = new Level2Parser(raf, data_block_pointer, this._record_offset)
        let data = {
            block_type: parser.getDataBlockString(0, 1),
            name: parser.getDataBlockString(1, 3),
            size: parser.getDataBlockShort(4),
            unambiguous_range: parser.getDataBlockShort(6),
            horizontal_noise_level: parser.getDataBlockFloat(8),
            vertical_noise_level: parser.getDataBlockFloat(12),
            nyquist_velocity: parser.getDataBlockShort(16)
        }

        record.radial = data
    }

    /**
     * Creates a new parser and grabs the data
     * from the data blocks. Then save that data
     * to the record.(reflect|velocity|spectrum|zdr|phi|rho)
     * Object base on what type being parsed
     * See page 115-117; Section "Data Block #4-9" https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
     */
    _parseMomentData(raf, record, data_block_pointer, type) {
        if(data_block_pointer > 0) {
            let parser = new Level2Parser(raf, data_block_pointer, this._record_offset)
            let data = {
                gate_count: parser.getDataBlockShort(8),
                first_gate: parser.getDataBlockShort(10) / 1000, // scale int to float 0.001 precision
                gate_size: parser.getDataBlockShort(12) / 1000, // scale int to float 0.001 precision
                rf_threshold: parser.getDataBlockShort(14) / 10, // scale int to float 0.1 precision
                snr_threshold: parser.getDataBlockShort(16) / 1000, // scale int to float 0.001 precision
                data_size: parser.getDataBlockByte(19),
                scale: parser.getDataBlockFloat(20),
                offset: parser.getDataBlockFloat(24),
                data_offset: data_block_pointer + 28,
                moment_data: []
            }
            
            switch(type) {
                case 'REF':
                    for(let i = 28; i <= 1867; i++) {
                        data.moment_data.push((parser.getDataBlockByte(i) - data.offset) / data.scale)
                    }
                    record.reflect = data
                    break
                case 'VEL':
                    for(let i = 28; i <= 1227; i++) {
                        data.moment_data.push((parser.getDataBlockByte(i) - data.offset) / data.scale)
                    }
                    record.velocity = data
                    break
                case 'SW':
                    for(let i = 28; i <= 1227; i++) {
                        data.moment_data.push((parser.getDataBlockByte(i) - data.offset) / data.scale)
                    }
                    record.spectrum = data
                    break
                case 'ZDR':
                    for(let i = 28; i <= 1227; i++) {
                        data.moment_data.push((parser.getDataBlockByte(i) - data.offset) / data.scale)
                    }
                    record.zdr = data
                    break
                /* case 'PHI':  
                    for(let i = 28; i <= 1227; i += 2) {
                        data.moment_data.push((parser.getDataBlockShort(i) - data.offset) / data.scale)
                    }
                    record.phi = data
                    break */
                case 'RHO':
                    // RHO - getting indexing errors - !!FIX!!
                    for(let i = 28; i <= 1227; i++) {
                        data.moment_data.push((parser.getDataBlockByte(i) - data.offset) / data.scale)
                    }
                    record.rho = data
                    break
            }
        }
    }

    /**
     * o--------------o-----------------------------o
     * | Message type | Data                        |
     * |--------------|-----------------------------|
     * | 2            | RDA Status                  |
     * | 3            | RDA Performance/Maintenance |
     * | 5,7          | RDA Volume Coverage         |
     * | 13           | Clutter Filter Bypass Map   |
     * | 15           | Clutter Map                 |
     * | 18           | RDA Adaptable Parameters    |
     * | 29           | Model Data Message          |
     * | 31           | Digital Radar Generic Format|
     * o--------------o-----------------------------o
     */
    _getRecord(raf) {
        raf.seek(this._record_offset)
        raf.skip(CTM_HEADER_SIZE)

        let message = {
            message_size: raf.readShort(),
            channel: raf.readByte(), 
            message_type: raf.readByte(),
            id_sequence: raf.readShort(),
            message_julian_date: raf.readShort(),
            message_mseconds: raf.readInt(),
            segment_count: raf.readShort(),
            segment_number: raf.readShort()
        }

		console.log(message.message_type);
        switch (message.message_type) {
			case 31: return parseMessage31(raf,message,this);
			case 1: return parseMessage1(raf,message);
			case 5:
			case 7: return parseMessage5(raf,message);
		}
    }
}

module.exports.Level2Record = Level2Record