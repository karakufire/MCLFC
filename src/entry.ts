"use strict";

const pattern = /^(?<!#)(.*?)(?==)(.*)$/g;
const nl = /\r?\n|\r/g;

/**
 * .property entry
 */
export class Entry {
    readonly is_comment: boolean;
    readonly contents: { tag: '#' | string; value: string; };
    readonly line: number;

    constructor(tag: string, value: string, line: number) {
        this.is_comment = (tag === '#');
        this.contents = { tag: tag, value: value };
        this.line = line;
    }

    toString() {
        return `${this.line}: ${this.contents.tag}=${this.contents.value}`;
    }
}

/**
 * Express couple of diffed entries.
 */
export class DiffLine {
    /**
     * .properties tag name
     */
    readonly tag: string;

    /**
     * value of 1st args. if null, will undifined.
     */
    readonly v1?: string;

    /**
     * lines of 1st args, if null, will -1.
     */
    readonly l1: number;

    /**
     * value of 2nd args. if null, will undifined.
     */
    readonly v2?: string;

    /**
     * lines of 2nd args, if null, will -1.
     */
    readonly l2: number;

    constructor(tag: string, content: { v1?: string, l1: number, v2?: string, l2: number }) {
        this.tag = tag;
        this.v1 = content.v1;
        this.l1 = content.l1;
        this.v2 = content.v2;
        this.l2 = content.l2;
    }

    get isDifferentLine() {
        return this.l1 !== this.l2;
    }

    get hasEitherNullValue() {
        return this.v1 == null || this.v2 == null;
    }

    toString() {
        return `${this.tag}\t${this.v1 || ''}\t${this.l1 >= 0 ? this.l1 : ''}\t${this.v2 || ''}\t${this.l2 >= 0 ? this.l2 : ''}`;
    }
}

export namespace Entry {
    class EmptyLine extends Entry {
        constructor(line: number) {
            super('', '', line);
        }

        isEmpty() { return true; }
        toString() { return `${this.line}: `; }
    }

    export function parseToEntries(content: string) {
        let lines = content.split(nl);
        return lines.map(__parse_line__);
    }

    export function dropEmptyLines(contents: Entry[]) {
        return contents.filter(n => !(n instanceof EmptyLine));
    }

    function __parse_line__(line: string, lineof: number) {
        const eq = line.indexOf('=');
        if (line.startsWith('#')) {
            const com = line.replace(/^# */, '');
            return new Entry('#', com, lineof);
        } else if (0 < eq) {
            const name = line.substring(0, eq);
            const val = line.substring(eq + 1);
            return new Entry(name, val, lineof);
        } else return new EmptyLine(lineof);
    }

    export function toRawText(data: Entry[]) {
        const digit = Math.max(...data.map(d => d.line)).toString().length;
        return data.map(d => `${('0'.repeat(digit) + d.line).slice(-digit)}:`
            + ` ${d instanceof EmptyLine ? '' : `${d.contents.tag}=${d.contents.value}`}`
        ).join('\n');
    }

}