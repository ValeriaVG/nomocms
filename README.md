# ![AMP CMS Logo](logo.svg)

[![Maintainability](https://api.codeclimate.com/v1/badges/6751f127815b5bac4cee/maintainability)](https://codeclimate.com/github/ValeriaVG/amp-cms/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6751f127815b5bac4cee/test_coverage)](https://codeclimate.com/github/ValeriaVG/amp-cms/test_coverage)

Content management system for blazingly fast AMP websites, written in TypeScript and powered by Redis.

AMP CMS is currently in active development. It's not ready for production use until it reaches v1.0.

Current stage: \__alpha_

## How to deploy

> Note: Currenty it's not possible to automatically create Redis database for you, please do it manually and then link to the app deployment either by adding existing database in App dashboard components and setting env variable `REDIS_URL` to `${your-db-name.REDIS_URL}`

> Note: App Platform uses public paths and CMS won't run without a database, do not restrict access by api until you know it's IP address

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/ValeriaVG/amp-cms/tree/main&refcode=6ad1223ed047)

## First-time & Emergency access

You can set up a superuser account though the following environment variables:

- `SUPERUSER_EMAIL`, by default is set to `clark.kent@daily.planet`
- `SUPERUSER_PASSWORD`, by default is set to `clark&lois`

> WARNING: consider changing the default superuser credentials

This user is never stored or rendered anywhere else, but has all possible permissions.

## Roadmap

- [x] API
  - [x] Core functionality
  - [x] Authorization
  - [x] Permissions
  - [x] Custom user fields
  - [x] Render user pages
  - [x] Analytics
- [x] Control Panel
  - [x] Base layout
  - [x] Templates Editor
  - [x] Styles Editor
  - [x] Content/Markup Editor
  - [x] Show pageviews
  - [ ] File manager / Image upload
- [x] Deploy at least one project with AMP CMS
- [x] Digital Ocean One-Click-Deploy

## Known bugs

- Currently updating template doesn't trigger update on existing pages
