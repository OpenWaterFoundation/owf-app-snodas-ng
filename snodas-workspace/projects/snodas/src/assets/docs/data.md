## SNODAS Tools / Data ##

The national SNODAS data are available from the Snow Data Assimilation System (SNODAS)
and can be viewed at
[National Operational Hydrologic Remote Sensing Center (NOHRSC)](https://www.nohrsc.noaa.gov/interactive/html/map.html)
The SNODAS data are processed into statistical data products by the SNODAS Tools.

The ***Daily Data*** and ***Upstream Total Data Products*** sections below use variables
in URL's to show example URLs for data files. The variable in examples must be replaced
with an appropriate value. Examples are as follows:

| Variable | Example | Description |
| ---- | ---- | ---- |
| `Local_Id` | `3280`,  `LAMC2U`, `EGLC2L_F` | The unique local basin ID. |
| `YYYYMMDD` | `20170101`, `20181221`, `20200325` | The year, month, and day format used in data files. |

### Daily Data ###

The output consists of comma-separated-value (CSV) files, including basin data for 
each day and historical period for each basin. Data files can be downloaded by accessing
the following URL resources. The zip file contains a shapefile with daily statistics
in the attribute table (attribute names have been truncated to adhere to shapefile limit).

| Link for downloading data file | Description |
| ---- | ---- |
| `https://snodas.cdss.state.co.us/data/SnowpackStatisticsByBasin/SnowpackStatisticsByBasin_Local_Id.csv`<br>Example: [`https://snodas.cdss.state.co.us/data/SnowpackStatisticsByBasin/SnowpackStatisticsByBasin_3236.csv`](https://snodas.cdss.state.co.us/data/SnowpackStatisticsByBasin/SnowpackStatisticsByBasin_3236.csv) | CSV file for the basin with ID `Local_Id`. |
| `https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_YYYYMMDD.csv`<br>Example: [`https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_20210715.csv`](https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_20210715.csv) | CSV file for all basins for the `YYYYMMDD` date.  |
| [`https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_LatestDate.csv`](https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_LatestDate.csv) | CSV file for all basins for the most recently processed data. |
| `https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_YYYYMMDD.geojson`<br>Example: [`https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_20210715.geojson`](https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_20210715.geojson) | GeoJSON file of all basins for the `YYYYMMDD` date. **Not currently working.** |
| [`https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_LatestDate.geojson`](https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_LatestDate.geojson) | GeoJSON file for all basins for the most recently processed data. |
| `https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_YYYYMMDD.zip`<br>Example: [`https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_20210715.zip`](https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_20210715.zip) | Shapefile from all basins for the `YYYYMMDD` date. |
| [`https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_LatestDate.zip`](https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_LatestDate.zip) | Shapefile for all basins for the most recently processed data. |

### Upstream Total Data Products ###

| Link for downloading data file | Description |
| ---- | ---- |
| [`https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_UpstreamTotal_LatestDate.csv`](https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_UpstreamTotal_LatestDate.csv) | Upstream data for all basins for the most recently processed data. |
| `https://snodas.cdss.state.co.us/data/SnowpackStatisticsByBasin/SnowpackStatisticsByBasin_UpstreamTotal_Local_Id.csv`<br>Example: [`https://snodas.cdss.state.co.us/data/SnowpackStatisticsByBasin/SnowpackStatisticsByBasin_UpstreamTotal_3236.csv`](https://snodas.cdss.state.co.us/data/SnowpackStatisticsByBasin/SnowpackStatisticsByBasin_UpstreamTotal_3236.csv) | Upstream data for the basin with ID `Local_Id` |
| `https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_UpstreamTotal_YYYYMMDD.csv`<br>Example: [`https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_UpstreamTotal_20210715.csv`](https://snodas.cdss.state.co.us/data/SnowpackStatisticsByDate/SnowpackStatisticsByDate_UpstreamTotal_20210715.csv) | Upstream data for all basins for the `YYYYMMDD` date. |

### Static Data Available for Download ###

| Link for downloading data file | Description |
| ---- | ---- |
| [`https://snodas.cdss.state.co.us/data/StaticData/CO_boundary.geojson`](https://snodas.cdss.state.co.us/data/StaticData/CO_boundary.geojson) | State of Colorado boundary. |
| [`https://snodas.cdss.state.co.us/data/StaticData/SNODAS_CO_BasinBoundaries.geojson`](https://snodas.cdss.state.co.us/data/StaticData/SNODAS_CO_BasinBoundaries.geojson) | Basin boundaries, same as daily boundaries. |
| [`https://snodas.cdss.state.co.us/data/StaticData/SNODAS_CO_BasinBoundaries.zip`](https://snodas.cdss.state.co.us/data/StaticData/SNODAS_CO_BasinBoundaries.zip) | Input basin boundary layer shapefile. |
| [`https://snodas.cdss.state.co.us/data/StaticData/WatershedConnectivity/Watershed_Connectivity_v4.xlsx`](https://snodas.cdss.state.co.us/data/StaticData/WatershedConnectivity/Watershed_Connectivity_v4.xlsx) | Input basin connectivity for total basin calculations. |

Refer to the [SNODAS Tools User Manual](http://software.openwaterfoundation.org/cdss-app-snodas-tools-doc-user/) and 
[SNODAS Tools Developer Manual](http://software.openwaterfoundation.org/cdss-app-snodas-tools-doc-dev/) for more information.

SNODAS data citation: National Operational Hydrologic Remote Sensing Center. 2004.
Snow Data Assimilation System (SNODAS) Data Products at NSIDC, Version 1. SWE dataset.
Boulder, Colorado USA. NSIDC: National Snow and Ice Data Center. doi:
dx.doi.org/10.7265/N5TB14TC. Data are accessed daily, and historical period is also
accessed as needed for historical period products.
