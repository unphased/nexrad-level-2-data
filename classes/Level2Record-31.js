'use strict'
// parse message type 31
module.exports = (raf,message,obj) => {
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
		dcount: raf.readShort()
	}

	/**
	 * Read and save the data pointers from the file
	 * so we know where to start reading within the file
	 * to grab the data from the data blocks
	 * See page 114 of https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/RDA_RPG_2620002P.pdf
	 */
	let dbp1 = raf.readInt()
	let dbp2 = raf.readInt()
	let dbp3 = raf.readInt()
	let dbp4 = raf.readInt()
	let dbp5 = raf.readInt()
	let dbp6 = raf.readInt()
	let dbp7 = raf.readInt()
	let dbp8 = raf.readInt()
	let dbp9 = raf.readInt()

	/**
	 * Parse all of our data inside the datablocks
	 * and save it to the message.record Object
	 */
	obj._parseVolumeData(raf, message.record, dbp1)
	obj._parseElevationData(raf, message.record, dbp2)
	obj._parseRadialData(raf, message.record, dbp3)
	obj._parseMomentData(raf, message.record, dbp4, 'REF')
	obj._parseMomentData(raf, message.record, dbp5, 'VEL')
	obj._parseMomentData(raf, message.record, dbp6, 'SW')
	obj._parseMomentData(raf, message.record, dbp7, 'ZDR')
	obj._parseMomentData(raf, message.record, dbp8, 'PHI')
	obj._parseMomentData(raf, message.record, dbp9, 'RHO')

	return message;
}