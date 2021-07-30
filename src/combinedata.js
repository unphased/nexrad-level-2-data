// combine data returned by multiple calls to the Level2Radar constructor

// individual data structures or arrays can be passed
// the last (rightmost) data structure "wins" if there are duplicates
const combine = (...args) => {
	// create a single flat array
	const rawData = args.flat();
	return rawData;
};

module.exports = combine;
