# ![NoMoCMS](./logo.svg)

[![Maintainability](https://api.codeclimate.com/v1/badges/fba64515ad8b4aa8c338/maintainability)](https://codeclimate.com/github/ValeriaVG/nomocms/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/fba64515ad8b4aa8c338/test_coverage)](https://codeclimate.com/github/ValeriaVG/nomocms/test_coverage)

Content management system for blazingly fast websites powered by Svelte.

NoMoCMS is currently in active development. It's not ready for production use until it reaches v1.0.

Current stage: alpha

## How to deploy

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/ValeriaVG/nomocms/tree/main&refcode=6ad1223ed047)

## First-time & Emergency access

You can set up a superuser account though the following environment variables:

- `SUPERUSER_EMAIL`, by default is set to `clark.kent@daily.planet`
- `SUPERUSER_PASSWORD`, by default is set to `clark&lois`

> WARNING: consider changing the default superuser credentials

## Development

To run on local machine you'll need:

- NodeJS (tested on v14.17.6)
- PostgreSQL with TimescaleDB extension enabled (or run `docker-compose up -d`)

To start in the development mode:

```
npm run dev
```

To build :

```
npm run build
```

To run all tests:

```
npm run test
```

## Disclaimer

Node.js is a trademark of Joyent, Inc. and is used with its permission. We are not endorsed by or
affiliated with Joyent.
