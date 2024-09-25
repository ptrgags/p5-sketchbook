# P5 Sketchbook (2016, 2021, 2023-2024)

Repo for storing my one-shot p5.js sketches. Contents are subject to change.

## Usage

visit https://ptrgags.dev/p5-sketchbook/ to see the demos. Each one has
a description to document it.

## Note about running locally

As a note-to-self, the navbar Web Component makes an assumption that this
repo is hosted with a prefix of `/p5-sketchbook/` (based on how the site is
hosted on GitHub). To do this, I just run my static server from the parent
directory that contains this repo.

```sh
# go up to the parent directory
cd ..
# now the index page will be http://localhost:8080/p5-sketchbook/
http-server
```

## Running unit tests

```sh
# (First time only) Install the dev dependency of vitest
npm install

# runs vitest
npm test
```
