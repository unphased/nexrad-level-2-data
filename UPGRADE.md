There are several breaking changes in 2.0.0.

# Unified data accessors
The following functions have all been modified to provide a unified set of paramater signatures:
- getHighresReflectivity
- getHeader
- getHighresVelocity
- getHighresSpectrum
- getHighresDiffReflectivity
- getHighresDiffPhase
- getHighresCorrelationCoefficient
The signature for these data accessors is now
```
getHighresReflectivity([scan])
```
Scan is an optional parameter. If provided a specific scan index is returned, if it is not provided an array of data from all available scans is returned.

## Removal of setScan(<int>)
Because all of the above functions can now be called with a specific scan the `setScan()` function has been removed. The alias `setSweep()` has also been removed.

# Elevation indices
Elevation indices used with `Level2Data.setElevation(<int>)` is now 1-based to follow the NOAA definition. The elevation array is sparse. A list of all available elevations is available from `Level2Data.listElevations()`. When first parsing the data the elevation is set to 1 by default, which may not contain data when processing chunks.

