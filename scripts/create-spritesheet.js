#!/usr/bin/env node

const path = require('path');
const spritesheet = require('./spritesheet').default;

const cwd = process.cwd();

const src = path.resolve(cwd, process.argv[2]);
const dest = path.resolve(cwd, process.argv[3]);
spritesheet(src, dest);
