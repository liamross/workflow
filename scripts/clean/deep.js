'use strict';

const clean = require('./clean');

// Add paths to items you wish to remove.
const paths = ['node_modules'];

clean('Cleaning node_modules', paths);
