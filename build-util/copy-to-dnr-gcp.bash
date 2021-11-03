#!/bin/bash
(set -o igncr) 2>/dev/null && set -o igncr; # this comment is required
# The above line ensures that the script can be run on Cygwin/Linux even with Windows CRNL

# Builds the Angular application.
buildDist() {
  ngBuildHrefOpt="."

  optimizationArg=""
  if [ "${doOptimization}" = "no" ]; then
    # Turn off optimization
    optimizationArg="--optimization=false"
  fi

  logInfo "Building the SNODAS application..."
  ng build --prod=true --aot=true --baseHref=${ngBuildHrefOpt} --namedChunks=false --outputHashing=all --sourceMap=false ${optimizationArg}
  logInfo "Done building."
}

# Determine the operating system that is running the script
# - mainly care whether Cygwin or MINGW (Git Bash)
checkOperatingSystem() {
  if [ -n "${operatingSystem}" ]; then
    # Have already checked operating system so return
    return
  fi
  operatingSystem="unknown"
  os=$(uname | tr '[:lower:]' '[:upper:]')
  case "${os}" in
    CYGWIN*)
      operatingSystem="cygwin"
      ;;
    LINUX*)
      operatingSystem="linux"
      ;;
    MINGW*)
      operatingSystem="mingw"
      ;;
  esac
}


# Echo to stderr
# - if necessary, quote the string to be printed
# - this function is called to print various message types
echoStderr() {
  echo "$@" 1>&2
}

# Get the user's login.
# - Git Bash apparently does not set $USER environment variable, not an issue on Cygwin
# - Set USER as script variable only if environment variable is not already set
# - See: https://unix.stackexchange.com/questions/76354/who-sets-user-and-username-environment-variables
getUserLogin() {
  if [ -z "${USER}" ]; then
    if [ -n "${LOGNAME}" ]; then
      USER=${LOGNAME}
    fi
  fi
  if [ -z "${USER}" ]; then
    USER=$(logname)
  fi
  # Else - not critical since used for temporary files
}

# Get the SNODAS application version.
# - the version is in the 'web/app-config.json' file in format:  "version": "0.7.0.dev (2020-04-24)"
# - the Info Mapper software version in 'assets/version.json' with format similar to above
getVersion() {
  # Application version
  if [ ! -f "${appConfigFile}" ]; then
    logError "Application version file does not exist: ${appConfigFile}"
    logError "Exiting."
    exit 1
  fi
  appVersion=$(grep '"version":' "${appConfigFile}" | cut -d ":" -f 2 | cut -d "(" -f 1 | tr -d '"' | tr -d ' ' | tr -d ',')
}

# Print a DEBUG message, currently prints to stderr.
logDebug() {
   echoStderr "[DEBUG] $*"
}

# Print an ERROR message, currently prints to stderr.
logError() {
   echoStderr "[ERROR] $*"
}

# Print an INFO message, currently prints to stderr.
logInfo() {
   echoStderr "[INFO] $*"
}

# Print an WARNING message, currently prints to stderr.
logWarning() {
   echoStderr "[WARNING] $*"
}

# Parse the command parameters
# - use the getopt command line program so long options can be handled
parseCommandLine() {
  # Single character options.
  optstring="hv"
  # Long options.
  optstringLong="help,nobuild,noupload,nooptimization,upload-assets,version"
  # Parse the options using getopt command.
  GETOPT_OUT=$(getopt --options ${optstring} --longoptions ${optstringLong} -- "$@")
  exitCode=$?
  if [ ${exitCode} -ne 0 ]; then
    # Error parsing the parameters such as unrecognized parameter.
    echoStderr ""
    printUsage
    exit 1
  fi
  # The following constructs the command by concatenating arguments.
  eval set -- "${GETOPT_OUT}"
  # Loop over the options
  while true; do
    #logDebug "Command line option is ${opt}"
    case "$1" in
      # --dryrun) # --dryrun  Indicate to GCP commands to do a dryrun but not actually upload.
      #   logInfo "--dryrun detected - will not change files on GCP"
      #   dryrun="--dryrun"
      #   shift 1
      #   ;;
      -h|--help) # -h or --help  Print the program usage
        printUsage
        exit 0
        ;;
      --nobuild) # --nobuild  Indicate to not build to staging area
        logInfo "--nobuild detected - will not build to 'dist' folder"
        doBuild="no"
        shift 1
        ;;
      --nooptimization) # --nooptimization  Control 'ng build --optimization'
        logInfo "--nooptimization detected - will set 'ng build --optimization=false"
        doOptimization="no"
        shift 1
        ;;
      --noupload) # --noupload  Indicate to create staging area dist but not upload
        logInfo "--noupload detected - will not upload 'dist' folder"
        doUpload="no"
        shift 1
        ;;
      --upload-assets) # --upload-assets  Indicate to only upload assets
        logInfo "--upload-assets detected - will upload only 'assets' folder"
        uploadOnlyAssets="yes"
        shift 1
        ;;
      -v|--version) # -v or --version  Print the program version
        printVersion
        exit 0
        ;;
      --) # No more arguments
        shift
        break
        ;;
      *) # Unknown option
        logError ""
        logError "Invalid option $1." >&2
        printUsage
        exit 1
        ;;
    esac
  done
}

# Print the program usage to stderr.
# - calling code must exit with appropriate code.
printUsage() {
  echoStderr ""
  echoStderr "Usage:  ${programName}"
  echoStderr ""
  echoStderr "Copy the SNODAS front end application files to the Google Cloud Platform static website folder(s),"
  echoStderr "using the GCP sync capabilities."
  echoStderr ""
  echoStderr "               ${GCPFolderVersionUrl}"
  echoStderr "  optionally:  ${GCPFolderLatestUrl}"
  echoStderr ""
  echoStderr "-h or --help            Print the usage."
  echoStderr "--nobuild               Do not run 'ng build...' to create the 'dist' folder contents, useful for testing."
  echoStderr "--noupload              Do not upload the staging area 'dist' folder contents, useful for testing."
  echoStderr "--nooptimization        Set --optimization=false for 'ng build' useful for troubleshooting."
  echoStderr "--upload-assets         Only upload (sync) the 'assets' folder."
  echoStderr "-v or --version         Print the version and copyright/license notice."
  echoStderr ""
}

# Print the script version and copyright/license notices to stderr.
# - calling code must exit with appropriate code.
printVersion() {
  echoStderr ""
  echoStderr "${programName} version ${programVersion} ${programVersionDate}"
  echoStderr ""
  echoStderr "Angular SNODAS"
  echoStderr "Copyright 2017-2021 Open Water Foundation."
  echoStderr ""
  echoStderr "License GPLv3+:  GNU GPL version 3 or later"
  echoStderr ""
  echoStderr "There is ABSOLUTELY NO WARRANTY; for details see the"
  echoStderr "'Disclaimer of Warranty' section of the GPLv3 license in the LICENSE file."
  echoStderr "This is free software: you are free to change and redistribute it"
  echoStderr "under the conditions of the GPLv3 license in the LICENSE file."
  echoStderr ""
}

# Sync to GCP.
syncFiles() {
  local GCPFolderUrl

  GCPFolderUrl=$1

  if [ "${operatingSystem}" = "cygwin" ] || [ "${operatingSystem}" = "linux" ]; then

    echo "Removing original files from ${GCPFolderUrl}"
    gsutil -m rm "${GCPFolderUrl}"/*

    echo "Syncing with Google Cloud Platform..."
    gsutil -m rsync -r "${snodasDistAppFolder}" "${GCPFolderUrl}"

    errorCode=$?
    if [ ${errorCode} -ne 0 ]; then
      logError "Error code ${errorCode} from 'aws' command.  Exiting."
      exit 1
    fi
  else
    logError ""
    logError "Don't know how to run on operating system ${operatingSystem}"
    exit 1
  fi
}

# Get the dist folder ready to sync with GCP.
uploadDist() {
  # Add an upload log file to the dist, useful to know who did an upload.
  uploadLogFile="${snodasDistAppFolder}/upload.log.txt"
  echo "UploadUser = ${USER}" > "${uploadLogFile}"
  now=$(date "+%Y-%m-%d %H:%M:%S %z")
  {
    echo "UploadTime = ${now}"
    echo "UploaderName = ${programName}"
    echo "UploaderVersion = ${programVersion} ${programVersionDate}"
    echo "AppVersion = ${appVersion}"
  } >> "${uploadLogFile}"
  
  if [ "${uploadOnlyAssets}" = "yes" ]; then
    # Adjust the source folder and URL to be more specific.
    echo "Only uploading 'assets' files."
    snodasDistAppFolder="${snodasDistAppFolder}/assets"
    GCPFolderVersionUrl="${GCPFolderVersionUrl}/assets"
    GCPFolderLatestUrl="${GCPFolderLatestUrl}/assets"
  fi

  # First upload to the version folder.
  echo "Uploading (GCP sync) application version ${appVersion}"
  echo "  from: ${snodasDistAppFolder}"
  echo "    to: ${GCPFolderVersionUrl}"
  echo "Uploading application ${appVersion} version."
  read -r -p "Continue [Y/n/q] (if 'n', will still be able to upload 'latest')? " answer
  if [ "${answer}" = "q" ] || [ "${answer}" = "Q" ]; then
    exit 0
  elif [ -z "${answer}" ] || [ "${answer}" = "y" ] || [ "${answer}" = "Y" ]; then
    logInfo "Starting GCP sync of ${appVersion} copy..."
    syncFiles "${GCPFolderVersionUrl}"
    logInfo "...done with GCP sync of ${appVersion} copy."
  fi

  # Next upload to the 'latest' folder.
  # - TODO smalers 2020-04-20 evaluate whether to prevent 'dev' versions to be updated to 'latest'.
  echo "Uploading Angular 'latest' version"
  echo "  from: ${snodasDistAppFolder}"
  echo "    to: ${GCPFolderLatestUrl}"
  read -r -p "Continue [Y/n/q]? " answer
  if [ "${answer}" = "q" ] || [ "${answer}" = "Q" ]; then
    exit 0
  elif [ -z "${answer}" ] || [ "${answer}" = "y" ] || [ "${answer}" = "Y" ]; then
    logInfo "Starting GCP sync of 'latest' copy..."
    syncFiles "${GCPFolderLatestUrl}"
    logInfo "...done with GCP sync of 'latest' copy."
  fi
}

# Entry point into the script.

# Check the operating system
checkOperatingSystem

getUserLogin

# Get the folder where this script is located since it may have been run from any folder (abs path).
scriptFolder=$(cd "$(dirname "$0")" && pwd)
# snodasRepoFolder is owf-app-snodas-ng (abs path).
snodasRepoFolder=$(dirname "${scriptFolder}")
# The top level folder of the SNODAS application.
snodasMainFolder="${snodasRepoFolder}"/snodas-workspace
snodasDistFolder="${snodasMainFolder}/dist"
snodasDistAppFolder="${snodasDistFolder}/snodas"
# Application configuration file used to extract application version and Google Analytics tracking ID.
appConfigFile="${snodasMainFolder}/projects/snodas/src/assets/app-config.json"
# Populate this program's variables.
programName=$(basename "$0")
programVersion="1.7.0"
programVersionDate="2021-11-01"

logInfo "scriptFolder:        ${scriptFolder}"
logInfo "Program name:        ${programName}"
logInfo "appConfigFile:       ${appConfigFile}"
logInfo "snodasRepoFolder:    ${snodasRepoFolder}"
logInfo "snodasMainFolder:    ${snodasMainFolder}"
logInfo "snodasDistFolder:    ${snodasDistFolder}"
logInfo "snodasDistAppFolder: ${snodasDistAppFolder}"
# - Put before parseCommandLine so can be used in print usage, etc.
getVersion
logInfo "Application version: ${appVersion}"

GCPFolderVersionUrl="gs://snodas.cdss.state.co.us/${appVersion}"
GCPFolderLatestUrl="gs://snodas.cdss.state.co.us/latest"

# Default is to build the dist and upload.
doBuild="yes"
doUpload="yes"
# Only update /assets
# - used when updating data files and configurations
# - should work OK but may need to refine to only upload data layers
#   but no configuration files
uploadOnlyAssets="no"
# Default is optimization for 'ng build', which is the ng default.
doOptimization="yes"

# Parse the command line arguments.
parseCommandLine "$@"

logInfo "Changing to:  ${snodasMainFolder}"
cd "${snodasMainFolder}" || exit

# Build the distribution.
if [ "${doBuild}" = "yes" ]; then
  buildDist
fi

# Upload the distribution to GCP.
if [ "${doUpload}" = "yes" ]; then
  uploadDist
fi

echo ""
logInfo "Successfully synced to GCP."
exit 0