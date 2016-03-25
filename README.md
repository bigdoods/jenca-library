[![Build Status](https://travis-ci.org/jenca-cloud/jenca-library.svg?branch=master)](https://travis-ci.org/jenca-cloud/jenca-library)

# jenca-library

The app library service for jenca-cloud.

## Development

Clone jenca-cloud repo and follow the readme for vagrant and jencactl to install this service image.

## routes

GET /v1/apps
GET /v1/apps/:appid

## CLI

For development and testing, within jenca-library directory run:
```bash
$ npm test
```

## Notes

`/apps` contains the RCs and services for K8S to run hosted apps
`/links` contains the descriptions and hyperlinks for externally linked apps

thumbnails for apps are found in `/assests/thumbnails` in the jenca-gui repo