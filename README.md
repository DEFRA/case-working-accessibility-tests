Accessibility tests for case working

The template to create a service that runs WDIO tests against an environment.

## Documentation

- **[Quick Reference](QUICK_REFERENCE.md)** - One-page cheat sheet
- **[Technology Stack](TECHNOLOGY_STACK.md)** - What tools we use and how they work
- **[Full Testing Guide](ACCESSIBILITY_TESTING_GUIDE.md)** - Comprehensive documentation
- **[Demo Presentation](ACCESSIBILITY_DEMO_SLIDES.md)** - Presentation slides
- **[Demo Setup Guide](DEMO_README.md)** - How to prepare and deliver the demo
- **[Executive Summary](EXECUTIVE_SUMMARY.md)** - High-level overview for stakeholders

## Technology Summary

We use **wcagChecker** (from `dist/wcagchecker.js`) for all accessibility testing. This is a custom wrapper that bundles axe-core v4.10.2 internally and provides WebDriverIO integration with HTML report generation. See [TECHNOLOGY_STACK.md](TECHNOLOGY_STACK.md) for details.

## Table of Contents

- [Local Development](#local-development)
  - [Requirements](#requirements)
    - [Node.js](#nodejs)
  - [Setup](#setup)
  - [Configure environment variables](#configure-environment-variables)
  - [Running local tests](#running-local-tests)
  - [Debugging local tests](#debugging-local-tests)
  - [Fixing ChromeDriver version mismatch](#fixing-chromedriver-version-mismatch)
- [Production](#production)
  - [Debugging tests](#debugging-tests)
- [Licence](#licence)
  - [About the licence](#about-the-licence)

## Local Development

### Requirements

#### Node.js

Please install [Node.js](http://nodejs.org/) `>= v20` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)

To use the correct version of Node.js for this application, via nvm:

```bash
nvm use
```

### Setup

Install application dependencies:

```bash
npm install
```

### Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Update `X_API_KEY` in `.env` with a fresh API key for the target environment. Keys can be generated from the CDP Portal for the relevant service. Make sure `ENVIRONMENT` is set to the environment you want to test against (e.g. `dev`, `test`, `perf-test`) and all other keys match that environment.

### Running local tests

The `.env` file must be loaded before running tests. Use the following command — it strips inline comments from `.env` before exporting to avoid shell parsing errors:

```bash
export $(cat .env | grep -v '^#' | sed 's/ #.*//' | xargs) && npm run test:local
```

### Debugging local tests

```bash
export $(cat .env | grep -v '^#' | sed 's/ #.*//' | xargs) && npm run test:local:debug
```

### Fixing ChromeDriver version mismatch

If you see an error like:

```
ChromeDriver only supports Chrome version X
Current browser version is Y
```

Update ChromeDriver to match your installed Chrome version (use the major version number):

```bash
npm install chromedriver@<your-chrome-major-version> --save-dev
```

For example, if your Chrome is version 147:

```bash
npm install chromedriver@147 --save-dev
```

## Production

### Running the tests

Tests are run from the CDP-Portal under the Test Suites section. Before any changes can be run, a new docker image must be built, this will happen automatically when a pull request is merged into the `main` branch.
You can check the progress of the build under the actions section of this repository. Builds typically take around 1-2 minutes.

The results of the test run are made available in the portal.

## Requirements of CDP Environment Tests

1. Your service builds as a docker container using the `.github/workflows/publish.yml`
   The workflow tags the docker images allowing the CDP Portal to identify how the container should be run on the platform.
   It also ensures its published to the correct docker repository.

2. The Dockerfile's entrypoint script should return exit code of 0 if the test suite passes or 1/>0 if it fails

3. Test reports should be published to S3 using the script in `./bin/publish-tests.sh`

## Running on GitHub

Alternatively you can run the test suite as a GitHub workflow.
Test runs on GitHub are not able to connect to the CDP Test environments. Instead, they run the tests agains a version of the services running in docker.
A docker compose `compose.yml` is included as a starting point, which includes the databases (mongodb, redis) and infrastructure (localstack) pre-setup.

Steps:

1. Edit the compose.yml to include your services.
2. Modify the scripts in docker/scripts to pre-populate the database, if required and create any localstack resources.
3. Test the setup locally with `docker compose up` and `npm run test:github`
4. Set up the workflow trigger in `.github/workflows/journey-tests`.

By default, the provided workflow will run when triggered manually from GitHub or when triggered by another workflow.

If you want to use the repository exclusively for running docker composed based test suites consider displaying the publish.yml workflow.

## BrowserStack

Two wdio configuration files are provided to help run the tests using BrowserStack in both a GitHub workflow (`wdio.github.browserstack.conf.js`) and from the CDP Portal (`wdio.browserstack.conf.js`).
They can be run from npm using the `npm run test:browserstack` (for running via portal) and `npm run test:github:browserstack` (from GitHib runner).
See the CDP Documentation for more details.

## Licence

THIS INFORMATION IS LICENSED UNDER THE CONDITIONS OF THE OPEN GOVERNMENT LICENCE found at:

<http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3>

The following attribution statement MUST be cited in your products and applications when using this information.

> Contains public sector information licensed under the Open Government licence v3

### About the licence

The Open Government Licence (OGL) was developed by the Controller of Her Majesty's Stationery Office (HMSO) to enable
information providers in the public sector to license the use and re-use of their information under a common open
licence.

It is designed to encourage use and re-use of information freely and flexibly, with only a few conditions.
