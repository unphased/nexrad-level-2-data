## Classes

<dl>
<dt><a href="#Level2Radar">Level2Radar</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#HighResData">HighResData</a> : <code>object</code></dt>
<dd><p>See NOAA documentation for detailed meanings of these values.</p>
</dd>
<dt><a href="#MessageHeader">MessageHeader</a> : <code>object</code></dt>
<dd><p>See NOAA documentation for detailed meanings of these values.</p>
</dd>
<dt><a href="#Radial">Radial</a></dt>
<dd></dd>
<dt><a href="#Volume">Volume</a></dt>
<dd></dd>
</dl>

<a name="Level2Radar"></a>

## Level2Radar
**Kind**: global class  

* [Level2Radar](#Level2Radar)
    * [new Level2Radar(file, [options])](#new_Level2Radar_new)
    * _instance_
        * _Configuration_
            * [.setElevation(elevation)](#Level2Radar+setElevation)
        * _Data_
            * [.getAzimuth([scan])](#Level2Radar+getAzimuth) ⇒ <code>number</code> \| <code>Array.&lt;number&gt;</code>
            * [.getHighresReflectivity([scan])](#Level2Radar+getHighresReflectivity) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresVelocity([scan])](#Level2Radar+getHighresVelocity) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresSpectrum([scan])](#Level2Radar+getHighresSpectrum) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresDiffReflectivity([scan])](#Level2Radar+getHighresDiffReflectivity) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresDiffPhase([scan])](#Level2Radar+getHighresDiffPhase) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
            * [.getHighresCorrelationCoefficient([scan])](#Level2Radar+getHighresCorrelationCoefficient) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
        * _Metadata_
            * [.getScans()](#Level2Radar+getScans) ⇒ <code>number</code>
            * [.getHeader([scan])](#Level2Radar+getHeader) ⇒ [<code>MessageHeader</code>](#MessageHeader)
            * [.listElevations()](#Level2Radar+listElevations) ⇒ <code>Array.&lt;number&gt;</code>
    * _static_
        * [.combineData(...data)](#Level2Radar.combineData) ⇒ [<code>Level2Radar</code>](#Level2Radar)

<a name="new_Level2Radar_new"></a>

### new Level2Radar(file, [options])
Parses a Nexrad Level 2 Data archive or chunk. Provide `rawData` as a `Buffer`. Returns an object formatted per the [ICD FOR RDA/RPG - Build RDA 20.0/RPG 20.0 (PDF)](https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620002U.pdf), or as close as can reasonably be represented in a javascript object. Additional data accessors are provided in the returned object to pull out typical data in a format ready for processing.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| file | <code>Buffer</code> \| [<code>Level2Radar</code>](#Level2Radar) |  | Buffer with Nexrad Level 2 data. Alternatively a Level2Radar object, typically used internally when combining data. |
| [options] | <code>object</code> |  | Parser options |
| [options.logger] | <code>object</code> \| <code>boolean</code> | <code>console</code> | By default error and information messages will be written to the console. These can be suppressed by passing false, or a custom logger can be provided. A custom logger must provide the log() and error() function. |

<a name="Level2Radar+setElevation"></a>

### level2Radar.setElevation(elevation)
Sets the elevation in use for get* methods

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Configuration  

| Param | Type | Description |
| --- | --- | --- |
| elevation | <code>number</code> | Selected elevation number |

<a name="Level2Radar+getAzimuth"></a>

### level2Radar.getAzimuth([scan]) ⇒ <code>number</code> \| <code>Array.&lt;number&gt;</code>
Returns an single azimuth value or array of azimuth values for the current elevation and scan (or all scans if not provided).The order of azimuths in the returned array matches the order of the data in other get* functions.

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: <code>number</code> \| <code>Array.&lt;number&gt;</code> - Azimuth angle  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan |

<a name="Level2Radar+getHighresReflectivity"></a>

### level2Radar.getHighresReflectivity([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar reflectivity data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res reflectivity data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan or null for all scans in elevation |

<a name="Level2Radar+getHighresVelocity"></a>

### level2Radar.getHighresVelocity([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar velocity data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res velocity data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan, or null for all scans in this elevation |

<a name="Level2Radar+getHighresSpectrum"></a>

### level2Radar.getHighresSpectrum([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar spectrum data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res spectrum data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan, or null for all scans in this elevation |

<a name="Level2Radar+getHighresDiffReflectivity"></a>

### level2Radar.getHighresDiffReflectivity([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar differential reflectivity data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res differential reflectivity data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan or null for all scans in elevation |

<a name="Level2Radar+getHighresDiffPhase"></a>

### level2Radar.getHighresDiffPhase([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar differential phase data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res differential phase data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan or null for all scans in elevation |

<a name="Level2Radar+getHighresCorrelationCoefficient"></a>

### level2Radar.getHighresCorrelationCoefficient([scan]) ⇒ [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData)
Returns an Object of radar correlation coefficient data for the current elevation and scan (or all scans if not provided)

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>HighResData</code>](#HighResData) \| [<code>Array.&lt;HighResData&gt;</code>](#HighResData) - Scan's high res correlation coefficient data, or an array of the data.  
**Category**: Data  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan or null for all scans in elevation |

<a name="Level2Radar+getScans"></a>

### level2Radar.getScans() ⇒ <code>number</code>
Return the number of scans in the current elevation

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Metadata  
<a name="Level2Radar+getHeader"></a>

### level2Radar.getHeader([scan]) ⇒ [<code>MessageHeader</code>](#MessageHeader)
Return message_header information for all scans or a specific scan for the selected elevation

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Metadata  

| Param | Type | Description |
| --- | --- | --- |
| [scan] | <code>number</code> | Selected scan, omit to return all scans for this elevation |

<a name="Level2Radar+listElevations"></a>

### level2Radar.listElevations() ⇒ <code>Array.&lt;number&gt;</code>
List all available elevations

**Kind**: instance method of [<code>Level2Radar</code>](#Level2Radar)  
**Category**: Metadata  
<a name="Level2Radar.combineData"></a>

### Level2Radar.combineData(...data) ⇒ [<code>Level2Radar</code>](#Level2Radar)
Combines the data returned by multiple runs of the Level2Data constructor. This is typically used in "chunks" mode to combine all azimuths from one revolution into a single data set. data can be provided as an array of Level2Radar objects, individual Level2Data parameters or any combination thereof.The combine function blindly combines data and the right-most argument will overwrite any previously provided data. Individual azimuths located in Level2Radar.data[] will be appended. It is up to the calling routine to properly manage the parsing of related chunks and send it in to this routine.

**Kind**: static method of [<code>Level2Radar</code>](#Level2Radar)  
**Returns**: [<code>Level2Radar</code>](#Level2Radar) - Combined data  

| Param | Type | Description |
| --- | --- | --- |
| ...data | [<code>Level2Radar</code>](#Level2Radar) | Data to combine |

<a name="HighResData"></a>

## HighResData : <code>object</code>
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| gate_count | <code>number</code> |  |
| gate_size | <code>number</code> |  |
| first_gate | <code>number</code> |  |
| rf_threshold | <code>number</code> |  |
| snr_threshold | <code>number</code> |  |
| scale | <code>number</code> |  |
| offset | <code>number</code> |  |
| block_type | <code>string</code> | 'D' |
| control_flags | <code>number</code> |  |
| data_size | <code>number</code> |  |
| name | <code>string</code> | 'REF', 'VEL', 'SW ', 'ZDR', 'PHI', 'RHO' |
| spare | <code>Array.&lt;Buffer&gt;</code> | Spare data per the documentation |
| moment_data | <code>Array.&lt;number&gt;</code> | Scaled data |

<a name="MessageHeader"></a>

## MessageHeader : <code>object</code>
See NOAA documentation for detailed meanings of these values.

**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| aim | <code>number</code> | 
| ars | <code>number</code> | 
| compress_idx | <code>number</code> | 
| cut | <code>number</code> | 
| dcount | <code>number</code> | 
| elevation_angle | <code>number</code> | 
| elevation_number | <code>number</code> | 
| id | <code>string</code> | 
| julian_date | <code>number</code> | 
| mseconds | <code>number</code> | 
| phi | [<code>HighResData</code>](#HighResData) | 
| radial | [<code>Radial</code>](#Radial) | 
| radial_length | <code>number</code> | 
| radial_number | <code>number</code> | 
| [reflect] | [<code>HighResData</code>](#HighResData) | 
| [rho] | [<code>HighResData</code>](#HighResData) | 
| rs | <code>number</code> | 
| rsbs | <code>number</code> | 
| spectrum | [<code>HighResData</code>](#HighResData) | 
| sp | <code>number</code> | 
| volume | [<code>Volume</code>](#Volume) | 
| [velocity] | [<code>HighResData</code>](#HighResData) | 
| [zdr] | [<code>HighResData</code>](#HighResData) | 

<a name="Radial"></a>

## Radial
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| block_type | <code>string</code> | 'R' |
| horizontal_calibration | <code>number</code> |  |
| horizontal_noise_level | <code>number</code> |  |
| name | <code>string</code> | 'RAD' |
| nyquist_velocity | <code>number</code> |  |
| radial_flags | <code>number</code> |  |
| size | <code>number</code> |  |
| unambiguous_range | <code>number</code> |  |
| vertical_calibration | <code>number</code> |  |
| vertical_noise_level | <code>number</code> |  |

<a name="Volume"></a>

## Volume
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| block_type | <code>string</code> | 'R' |
| calibration | <code>number</code> |  |
| differential_phase | <code>number</code> |  |
| differential_reflectivity | <code>number</code> |  |
| elevation | <code>number</code> |  |
| feedhorn_height | <code>number</code> |  |
| latitude | <code>number</code> |  |
| longitude | <code>number</code> |  |
| name | <code>string</code> | 'VOL' |
| processing_status | <code>number</code> |  |
| size | <code>number</code> |  |
| tx_horizontal | <code>number</code> |  |
| tx_vertical | <code>number</code> |  |
| version_major | <code>number</code> |  |
| version_minor | <code>number</code> |  |
| volume_coverage_pattern | <code>number</code> |  |
| zdr_bias_estimate | <code>number</code> |  |

