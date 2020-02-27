'use strict';

import * as fs from 'fs';
import * as path from 'path';
import * as program from 'commander';
import * as col from 'colors/safe';

import * as errors from './errors';
import { Entry, DiffLine } from './entry';

const VERSION = '1.0.1';

const title = 'langdiff - A tool of comparing two files both of minecraft lang files.';

program.version(VERSION);
program.arguments('<original> <translated>');
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
    if (program.args.length < 2) throw new errors.NotEnoughArgs('Not Enough Args: Requires 2 args.');

    const path_origin = program.args[0];
    const path_trsltd = program.args[1];

    if (!fs.existsSync(path_origin)) throw new errors.NoSuchFile(path_origin);
    if (!fs.existsSync(path_trsltd)) throw new errors.NoSuchFile(path_trsltd);

    const content_origin = fs.readFileSync(path_origin, 'utf-8');
    const content_trsltd = fs.readFileSync(path_trsltd, 'utf-8');

    const entries_origin = Entry.dropEmptyLines(Entry.parseToEntries(content_origin)).filter(e => !e.is_comment);
    const entries_trsltd = Entry.dropEmptyLines(Entry.parseToEntries(content_trsltd)).filter(e => !e.is_comment);

    let diffed = DiffLine.diff(entries_origin, entries_trsltd);
    if (program['differences']) {
        diffed = diffed.filter(e => e.isDifferentLine || e.hasEitherNullValue);
    } else if (program['untranslated']) {
        diffed = diffed.filter(e => e.hasEitherNullValue && (e.l2 < 0));
    }

    const header = (
        `property name\t` +
        `value of ${path.basename(path_origin)}\t` +
        `line of ${path.basename(path_origin)}\t` +
        `value of ${path.basename(path_trsltd)}\t` +
        `line of ${path.basename(path_trsltd)}\t`
    );

    if (program['output']) {
        const out = diffed.map(e => e.toString());
        out.unshift(header);
        const outPath = program['output'];
        fs.writeFileSync(outPath, out.join('\n'));
        console.log(`successfully output. see ${path.resolve(outPath)}`);
    } else {
        const out = diffed.map(e => {
            if (e.isDifferentLine) return col.yellow(e.toString());
            else if (e.hasEitherNullValue && e.l2 < 0) return col.bgRed(e.toString());
            else if (e.hasEitherNullValue && e.l1 < 0) return col.bgGreen(e.toString());
            else return e.toString();
        });
        out.unshift(col.inverse(header));
        console.log(out.join('\n'));
    }
    return;
}