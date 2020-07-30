'use strict'
// parse message type 5 and 7
module.exports = (raf, message) => {

	message.record = {
		message_size: raf.readShort(),
		pattern_type: raf.readShort(),
		pattern_number: raf.readShort(),
		num_elevations: raf.readShort(),
		version: raf.readByte(),
		clutter_number: raf.readByte(),
		velocity_resolution: velocity_resolution(raf.readByte()),
		pulse_width: pulse_width(raf.readByte()),
		reserved1: raf.readInt(),
		vcp_sequencing: vcp_sequencing(raf.readShort()),
		vcp_supplemental_raw: raf.readShort(),
		reserved2: raf.readShort(),
	}

	// read each elevation
	message.record.elevations = [];

	for (let i = 0; i < message.record.num_elevations; i++) {
		const elev = {
			elevation_angle: parse360Angle(raf.readShort()),
			channel_config: raf.readByte(),
			waveform_type: raf.readByte(),
			super_res_control: super_res_control(raf.readByte()),
			surv_prf_number: raf.readByte(),
			surv_prf_pulse: raf.readShort(),
			azimuth_rate: azimuth_rate(raf.readShort()),
			ref_threshold: raf.readShort(),
			vel_threshold: raf.readShort(),
			sw_threshold: raf.readShort(),
			diff_ref_threshold: raf.readShort(),
			diff_ph_threshold: raf.readShort(),
			cor_coeff_threshold: raf.readShort(),
			edge_angle_s1: parse360Angle(raf.readShort()),
			prf_num_s1: raf.readShort(),
			prf_pulse_s1: raf.readShort(),
			supplemental_data: supplemental_data(raf.readShort()),
			edge_angle_s2: parse360Angle(raf.readShort()),
			prf_num_s2: raf.readShort(),
			prf_pulse_s2: raf.readShort(),	
			ebc_angle: parse360Angle(raf.readShort()),
			edge_angle_s3: parse360Angle(raf.readShort()),
			prf_num_s3: raf.readShort(),
			prf_pulse_s3: raf.readShort(),
			reserved: raf.readShort(),
		}
		message.record.elevations.push(elev);
	}

	return message;
}

// extract bits (inclusive) and return as an int, or boolean if single bit
const parseBits = (raw, start, end) => {
	if (end !== undefined) {
		let val = 0;
		for (let i = start; i <= end; i++) {
			if (raw & 2**i) val += 2**(i-start);
		};
		return val;
	}
	return ((raw & 2**start) > 0)
}

// parse an angle 0-360
// bit 15 = 180, halves from there with 3 being the least significant bit
const parse360Angle = (raw) => {
	let angle = 0;
	for (let i = 15; i >= 3; i--) {
		if (parseBits(raw,i)) angle += 180/2**(15-i);
	}
	return angle;
}

// parse velocity resolution
const velocity_resolution = (raw) => {
	if (raw == 2) return 0.5;
	return 1.0;
}

// parse pulse width
const pulse_width = (raw) => {
	if (raw == 2) return 'short';
	return 'Long';
}

// parse vcp sequencing
const vcp_sequencing = (raw) => ({
	elevations: parseBits(raw,0,4),
	max_sails_cuts: parseBits(raw,5,6),
	sequence_active: parseBits(raw,13),
	truncated_vcp: parseBits(raw,14),
});

// parse super resolution control
const super_res_control = (raw) =>( {
	super_res: {
		halfDegreeAzimuth: parseBits(raw,0),
		quarterKm: parseBits(raw,1),
		'300km': parseBits(raw,2),
	},
	dual_pol: {
		'300km': parseBits(raw,3),
	},
});

// parse azimuth rate
const azimuth_rate = (raw) => {
	let rate = 0;
	for (let i = 14; i >= 3; i--) {
		if (parseBits(raw,i)) rate += 22.5/2**(14-i);
	}
	// negate for sign bit if necessary
	if (parseBits(raw,15)) rate = -rate;
	return rate;
}

// parse elevation supplemental data
const supplemental_data = (raw) => ({
	sails_cut: parseBits(raw,0),
	sails_sequence: parseBits(raw,1,3),
	mrle_cut: parseBits(raw,4),
	mrle_sequence: parseBits(raw,5,7),
	mpda_cut: parseBits(raw,9),
	base_tilt_cut: parseBits(raw,10),
})