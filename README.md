# owf-app-snodas-ng #

Open Water Foundation Snow Data Assimilation System (SNODAS) data viewing web application.

* [Introduction](#introduction)
* [Repository Contents](#repository-contents)
* [Getting Started](#getting-started)
* [Running the Application](#running-the-application)
* [Maintainers](#maintainers)
* [Contributors](#contributors)
* [License](#license)
* [Resources](#resources)

## Introduction ##

This repository contains files for developing and deploying the OWF SNODAS application,
developed using the [Angular](https://angular.io/) web framework.

This is an Angular version of the
[CDSS SNODAS Tools](https://github.com/OpenWaterFoundation/cdss-app-snodas-tools)
software, which improves on the original version: standard development environment, better
layout management, object-oriented programming with TypeScript, support for mobile devices,
automated testing, ect. This version is intended to be an option for applications outside of the
original implementation for the State of Colorado.

It is also an updated version of the
[Old CDSS SNODAS Tools](https://github.com/OpenWaterFoundation/owf-app-snodas-old-ng)
that updates the application from Angular 8 to Angular 11, and replaces HTML 5 code with Angular
based components, data binding, interpolation, etc.

## Repository Contents ##

The following folder structure is recommended for development. Top-level folders should be
created as necessary. The following folder structure clearly separates user files (as per
operating system), development area (owf-dev), product (SNODAS), repositories for product
(git-repos), and specific repositories for the product. Repository folder names should agree
with GitHub repository names. Scripts in repository folders that process data should detect
their starting location and then locate other folders using relative paths, based on the
following convention.

```
C:\Users\user\                              User's home folder for Windows.
/c/Users/user/                              User's home folder for Git Bash.
/cygdrive/C/Users/user/                     User's home folder for Cygwin.
/home/user/                                 User's home folder for Linux.
  owf-dev/                                  Work done on Open Water Foundation projects.
    SNODAS/                                 SNODAS product files.
      ---- below here folder names should match exactly ----
      git-repos/                            Git repositories for InfoMapper.
        owf-app-snodas-ng/                  Angular SNODAS web application.
```

This repository contains the following:

```
owf-app-snodas-ng/
  build-util/                               Scripts to manage repository, as needed.
  snodas-workspace/                         Top-level folder for the Angular workspace.
    projects/                               Holds all projects in the workspace. (apps, libraries)
      snodas/                               SNODAS source and testing code.
  .git                                      Standard Git software folder for repository (DO NOT TOUCH).
  .gitattributes                            Standard Git configuration file for repository (for portability).
  .gitignore                                Standard Git configuration file to ignore dynamic files.
  README.md                                 This README file.
```

## Getting Started ##

Development and deployment of this angular based web application requires the following tools:

1. **Node.js** - To install, go to the [Node.js website](https://nodejs.org).
2. **npm** - npm is automatically installed with Node.js. To check what version of npm is
installed run `npm -v`. To update npm run `npm install npm@latest -g`.
3. Angular CLI - To check what version is installed run `ng --version`. If Angular CLI needs
installed run `npm install -g @angular/cli`.

## Running the Application ##

To run the application locally, such as during development:

1. Open a Linux shell (ex. Git Bash, Cygwin).

2. `cd` to the `snodas-workspace/projects/snodas/` folder.

3. Update the Angular packages and dependencies by running `npm install`.
   
4. Serve the application using a local web server and open browser window by running
`ng serve --open`. 

5. Use CTRL-c to kill the local server.

## Maintainers ##



## License ##



## Resources ##

