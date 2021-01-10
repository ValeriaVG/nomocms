# ![AMP CMS Logo](logo.svg)

[![Maintainability](https://api.codeclimate.com/v1/badges/6751f127815b5bac4cee/maintainability)](https://codeclimate.com/github/ValeriaVG/amp-cms/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6751f127815b5bac4cee/test_coverage)](https://codeclimate.com/github/ValeriaVG/amp-cms/test_coverage)

Content management system for blazingly fast AMP websites, written in TypeScript and powered by Redis.

AMP CMS is currently in active development and the alpha version should be expected before Jan 10, 2021.

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
- [x] Control Panel
  - [x] Base layout
  - [x] Templates Editor
  - [x] Styles Editor
  - [x] Content/Markup Editor
  - [ ] File manager / Image upload
- [x] Page Analytics
- [ ] Deploy at least one project with AMP CMS
- [ ] Digital Ocean One-Click-Deploy
