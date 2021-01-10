# ![AMP CMS Logo](logo.svg)

[![Maintainability](https://api.codeclimate.com/v1/badges/6751f127815b5bac4cee/maintainability)](https://codeclimate.com/github/ValeriaVG/amp-cms/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6751f127815b5bac4cee/test_coverage)](https://codeclimate.com/github/ValeriaVG/amp-cms/test_coverage)

Content management system for blazingly fast AMP websites, written in TypeScript and powered by Redis.

AMP CMS is currently in active development and the alpha version should be expected before Jan 10, 2021.

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/ValeriaVG/amp-cms/tree/main)

## First-time & Emergency access

You can set up a superuser account though the following environment variables:

- `SUPERUSER_EMAIL`
- `SUPERUSER_PASSWORD`

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
- [ ] Deploy at least one project with AMP CMS
- [ ] Digital Ocean One-Click-Deploy
