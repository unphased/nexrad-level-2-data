# nexrad-level-2-data

> A javascript implementation for decoding Nexrad Level II radar archive files. It currently does not support decoding bzip compressed radar data, or non-highres radar data. 

You can find more information on how radar data is encoded at [NOAA](https://www.roc.noaa.gov/WSR88D/BuildInfo/Files.aspx) mainly in the document [ICD FOR RDA/RPG - Build RDA 19.0/RPG 19.0 (PDF)](https://www.roc.noaa.gov/wsr88d/PublicDocs/ICDs/2620002T.pdf)

## Contents
1. [Install](#install)
1. [Usage](#usage)
1. [API](#api)
1. [Supported Messages](#supported-messages)
1. [Acknowledgements](#acknowledgements)

## Install

``` bash
$ npm i nexrad-level-2-data
```

## Usage
``` javascript
const { Level2Radar } = require('nexrad-level-2-data')
const file_to_load = "./data/KTLX20130420_205120_V06" // The radar archive file to load

new Level2Radar(file_to_load).then(radar => {
    console.log(radar.getHighresReflectivity())
})
```

## API

### setElevation(Number elevation)
Sets the elevation you want to grab the data from

### setScan(Number scan)
Sets the current scan you want to grab the data from

### setSweep(Number sweep)
Alias for **setScan**

### getHighresReflectivity()
Returns an Object of radar reflectivity data for the current **elevation** and **scan** in the following format

``` javascript
{ 
  	gate_count: Number,
	first_gate: Number,
	gate_size: Number,
	rf_threshold: Number,
	snr_threshold: Number,
	scale: Number,
	offset: Number,
	data_offset: Number,
	moment_data: Array
}
```

### getHighresVelocity()
Returns an Object of radar velocity data for the current **elevation** and **scan** in the following format

``` javascript
{ 
  	gate_count: Number,
	first_gate: Number,
	gate_size: Number,
	rf_threshold: Number,
	snr_threshold: Number,
	scale: Number,
	offset: Number,
	data_offset: Number,
	moment_data: Array
}
```

### getHighresSpectrum()
Returns an Object of radar spectrum data for the current **elevation** and **scan** in the following format

``` javascript
{ 
  	gate_count: Number,
	first_gate: Number,
	gate_size: Number,
	rf_threshold: Number,
	snr_threshold: Number,
	scale: Number,
	offset: Number,
	data_offset: Number,
	moment_data: Array
}
```

### getHighresDiffReflectivity()
Returns an Object of radar diff reflectivity data for the current **elevation** and **scan** in the following format

``` javascript
{ 
  	gate_count: Number,
	first_gate: Number,
	gate_size: Number,
	rf_threshold: Number,
	snr_threshold: Number,
	scale: Number,
	offset: Number,
	data_offset: Number,
	moment_data: Array
}
```

### getHighresDiffPhase()
Returns an Object of radar diff phase data for the current **elevation** and **scan** in the following format

``` javascript
{ 
  	gate_count: Number,
	first_gate: Number,
	gate_size: Number,
	rf_threshold: Number,
	snr_threshold: Number,
	scale: Number,
	offset: Number,
	data_offset: Number,
	moment_data: Array
}
```

### getHighresCorrelationCoefficient()
Returns an Object of radar correlation coefficient data for the current **elevation** and **scan** in the following format

``` javascript
{ 
  	gate_count: Number,
	first_gate: Number,
	gate_size: Number,
	rf_threshold: Number,
	snr_threshold: Number,
	scale: Number,
	offset: Number,
	data_offset: Number,
	moment_data: Array
}
```
## Supported Messages
Nexrad data is stored as message types. This package currently processes the following messages.
|Message|Title|Description|
|---|---|---|
|1|Digital Radar Data|Reflectivity and velocity data. Replace. by message 31 in 2008 which supports a higher resolution.|
|5|Volume Coverage Pattern|Overview of the scanning paramaters|
|7|Volume Coverage Pattern|Overview of the scanning paramaters|
|31|Digital Radar Data Generic Format|Reflectivity and velocity data

## Acknowledgements
This work is based on the project of [Unidata](https://github.com/Unidata/thredds/blob/master/cdm/src/main/java/ucar/nc2/iosp/nexrad2/)
and [nexrad-radar-data](https://github.com/bartholomew91/nexrad-radar-data)