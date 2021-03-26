## SNODAS Tools Data ##

The national SNODAS data are available from the Snow Data Assimilation System (SNODAS) and can
be viewed at National Operational Hydrologic Remote Sensing Center (NOHRSC). The SNODAS data are
processed into statistical data products by the CDSS SNODAS Tools.

The **Daily Data** and **Upstream Total Data Products** sections below use variables in URL's
to show an example of what a URL could look like. They will need to be replaced with an
appropriate value. Examples are as follows

| Variable | Example | Description |
| ---- | ---- | ---- |
| `Local_Id` | 3280,  LAMC2U, EGLC2L_F | The unique local basin ID. |
| `YYYYMMDD` | 20170101, 20181221, 20200325 | The year, month, and day format used by CDSS. |

### Daily Data ###
The output consists of comma-separated-value (CSV) files  (basin data for each day) and
(historical period for each basin). Data files can be downloaded by accessing the following URL
resources. The zip file contains a shapefile with daily statistics in the attribute table
(attribute names have been truncated to adhere to shapefile limit).

| Link for downloading data file | Description |
| ---- | ---- |
| `snodas.cdss.state.co.us/app/SnowpackStatisticsByBasin/SnowpackStatisticsByBasin_Local_Id.csv` | CSV file for the basin with ID `Local_Id`. |
| `snodas.cdss.state.co.us/app/SnowpackStatisticsByDate/SnowpackStatisticsByDate_YYYYMMDD.csv` | CSV file for all basins at the `YYYYMMDD` date.  |
| snodas.cdss.state.co.us/app/SnowpackStatisticsByDate/SnowpackStatisticsByDate_LatestDate.csv | CSV file for all basins for the most recently pulled data. |
| `snodas.cdss.state.co.us/app/SnowpackStatisticsByDate/SnowpackStatisticsByDate_YYYYMMDD.geojson` | GeoJSON file of all basins at the `YYYYMMDD` date.  |
| snodas.cdss.state.co.us/app/SnowpackStatisticsByDate/SnowpackStatisticsByDate_LatestDate.geojson | geoJSON file for all basins for the most recently pulled data. |
| `snodas.cdss.state.co.us/app/SnowpackStatisticsByDate/SnowpackStatisticsByDate_YYYYMMDD.zip` | Shapefile from all basins at the `YYYYMMDD` date. |
| snodas.cdss.state.co.us/app/SnowpackStatisticsByDate/SnowpackStatisticsByDate_LatestDate.zip | Shapefile for all basins for the most recently pulled data. |

### Upstream Total Data Products ###

| Link for downloading data file | Description |
| ---- | ---- |
| snodas.cdss.state.co.us/app/SnowpackStatisticsByDate/SnowpackStatisticsByDate_UpstreamTotal_LatestDate.csv | Upstream data for all basins for the most recently pulled data. |
| `snodas.cdss.state.co.us/app/SnowpackStatisticsByBasin/SnowpackStatisticsByBasin_UpstreamTotal_Local_Id.csv` | Upstream data for the basin with ID `Local_Id` |
| `snodas.cdss.state.co.us/app/SnowpackStatisticsByDate/SnowpackStatisticsByDate_UpstreamTotal_YYYYMMDD.csv` | Upstream data for all basins at the `YYYYMMDD` date. |

### Static Data Available for Download ###

| Link for downloading data file | Description |
| ---- | ---- |
| snodas.cdss.state.co.us/app/json/CO_boundary.geojson | State of Colorado boundary. |
| snodas.cdss.state.co.us/app/json/SNODAS_CO_BasinBoundaries.geojson | Basin boundaries, same as daily boundaries. |
| snodas.cdss.state.co.us/app/StaticData/SNODAS_CO_BasinBoundaries.zip | Input basin boundary layer shapefile. |
| snodas.cdss.state.co.us/app/StaticData/Watershed_Connectivity_v4.xlsx | Input basin connectivity for total basin calculations. |


<br><br><br><br>
Refer to the [SNODAS Tools User Manual](software.openwaterfoundation.org/cdss-app-snodas-tools-doc-user/) and 
[SNODAS Tools Developer Manual](software.openwaterfoundation.org/cdss-app-snodas-tools-doc-dev/) for more information.


SNODAS data citation: National Operational Hydrologic Remote Sensing Center. 2004. Snow Data Assimilation System (SNODAS) Data Products at NSIDC, Version 1. SWE dataset. Boulder, Colorado USA. NSIDC: National Snow and Ice Data Center. doi: dx.doi.org/10.7265/N5TB14TC. Data are accessed daily, and historical period is also accessed as needed for historical period products.