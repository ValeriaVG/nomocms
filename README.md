# NoMoCMS

[![Maintainability](https://api.codeclimate.com/v1/badges/6751f127815b5bac4cee/maintainability)](https://codeclimate.com/github/ValeriaVG/nomocms/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6751f127815b5bac4cee/test_coverage)](https://codeclimate.com/github/ValeriaVG/nomocms/test_coverage)

Content management system for blazingly fast websites powered by AMP.

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

- NodeJS v14.5.0
- Yarn
- PostgreSQL (or run `docker-compose up -d`)

To start server in the development mode:

```
yarn dev:server
```

To start dashboard in the development mode:

```
yarn dev:dashboard
```

To build server:

```
yarn build:server
```

To build dashboard:

```
yarn build:dashboard
```

To run all tests:

```
yarn test
```

To run specific test:

```
yarn test <fileName or RegExp>
```

## Disclaimer

Node.js is a trademark of Joyent, Inc. and is used with its permission. We are not endorsed by or
affiliated with Joyent.
