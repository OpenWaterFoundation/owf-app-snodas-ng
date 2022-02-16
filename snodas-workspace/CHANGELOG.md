# Open Water Foundation SNODAS Changelog #

Optional elements to be added to each package version are as follows:

* Bug Fixes
* Refactoring
* Features / Enhancements
* Performance Improvements
* Breaking Changes

These elements will only be added if they are applicable for the new version.

# 2.2.0 (2022-02-15) #

### Bug Fixes ###

* The new refresh capabilities from the **Features / Enhancements** section below also
serve as a bug fix. Refreshing the page twice a day helps keep the dates retrieved from the
`ListOfDates.txt` file up to date. The refresh clock tooltip discussed below also helps
communicating to the user what the application's data currently looks like.

### Refactoring ###

* Converted the `copy-to-owf-amazon-s3.sh` file to `copy-to-owf-amazon-s3.bash` for newer
features, and changed a few lines that Shellcheck recommended updating for POSIX compatibility.
* Various functions in the Map Component `buildMap()` method was refactored and made less
convoluted. Reverted a change that introduced a bug by surrounding ${dryrun} in double
quotes.
* The `updateBasinFunction` event emitter was changed from sending a basin's full name to
the basin's ID. This way, the Map Component didn't need logic to parse out the ID anymore.

### Features / Enhancements ###

* Added a clock icon next to the **Selected SNODAS Date** in the side bar. A mouse hover will
reveal page refresh information.
* Added a new `app-config.json` property: **refreshTime**, which uses times to refresh the
page at times throughout the day. Set to 8:30am and 2:00pm, but more times can be added. See
more information on the SNODAS GitHub issue
[#29](https://github.com/OpenWaterFoundation/owf-app-snodas-ng/issues/29).
* The `ngx-cookie` package was installed and used to save a selected basin on the map after a
refresh.