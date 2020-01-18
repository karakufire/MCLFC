'use strict';

import * as fs from 'fs';
import * as program from 'commander';
import * as col from 'colors/safe';

import * as errors from './errors';

const VERSION = '1.0.0';

const title = 'langdiff - A tool of comparing two files both of minecraft lang files.';

program.version(VERSION);
program.arguments('<file1> <file2>');
program.name();
program.option('-o, --output <PATH>', 'set output file path');
program.option('-d, --differences', 'outputs different lines, untranslated entries and no-in-original entries');
program.option('-u, --untranslated', 'outputs untranslated entries only');

program.parse(process.argv);
try {
    main();
} catch (error) {
    console.log(error.message);
    program.outputHelp();
}

function main() {
    if (program.args.length < 2) throw new errors.NotEnoughArgs('Not Enough Args: Args must be 2.');
    if (!fs.existsSync(program.args[0])) throw new errors.NoSuchFile(program.args[0]);
    if (!fs.existsSync(program.args[1])) throw new errors.NoSuchFile(program.args[1]);
}