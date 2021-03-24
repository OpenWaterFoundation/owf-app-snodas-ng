## SNODAS Tools Documentation: ##

#### Analysis Process ####

SNODAS data are processed into data products using QGIS and Python software as follows:

1. Download daily SNODAS SWE national data.
2. Clip the national data to the extent of the Colorado water supply basin boundaries and save as TIF image. 
Basins extend outside of the Colorado boundary.
3. Use the Colorado SNODAS SWE TIF image and water supply basin boundaries to calculate statistics for the basins.
The effective area used in calculations is that of the sum of the SNODAS grid cells, which differs slightly from
the original basin boundary area. SNODAS analysis excludes water bodies.
4. Output results to comma-separated-value (CSV), GeoJSON map layer, and zipped shapefile. CSV files are generated
by basin and by date to facilitate use in the website and by other applications.
5. Process CSV files into time series graph products using CDSS TSTool software.
6. Publish files to this CDSS SNODAS Tools website.

#### Documentation ####
A summary of the analysis steps are described in the
<a href="http://software.openwaterfoundation.org/cdss-app-snodas-tools-doc-user/" target="_blank">SNODAS Tools User
Manual</a>. More detailed explanation is provided in the
<a href="http://software.openwaterfoundation.org/cdss-app-snodas-tools-doc-dev/" target="_blank">SNODAS Tools
Developer Manual</a>.</p>