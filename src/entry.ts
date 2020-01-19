"use strict";

import * as util from './util';

const pattern = /^(?<!#)(.*?)(?==)(.*)$/g;
const nl = /\r?\n|\r/g;

/**
 * An entry of lang file.
 */
export class Entry {
    readonly is_comment: boolean;
    readonly tag: '#' | string;
    readonly value: string;
    readonly line: number;

    constructor(tag: string, value: string, line: number) {
        this.is_comment = (tag === '#');
        this.tag = tag;
        this.value = value;
        this.line = line;
    }

    isEmpty() { return false; }

    toString() {
        return `${this.line}: ${this.tag}=${this.value}`;
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
        if (this.l1 >= 0 && this.l2 >= 0) return this.l1 !== this.l2;
        else return false;
    }

    get hasEitherNullValue() {
        return this.v1 == null || this.v2 == null;
    }

    toString() {
        return `${this.tag}\t${this.v1 || ''}\t${this.l1 >= 0 ? this.l1 + 1 : ''}\t${this.v2 || ''}\t${this.l2 >= 0 ? this.l2 + 1 : ''}`;
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

    /**
     * Parse to entries array from read file.
     * @param content 
     */
    export function parseToEntries(content: string) {
        let lines = content.split(nl);
        return lines.map(__parse_line__);
    }

    /**
     * Strip empty lines from entries array.
     * @param contents 
     */
    export function dropEmptyLines(contents: Entry[]) {
        return contents.filter(n => !(n.isEmpty()));
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

    function toRawText(data: Entry[]) {
        const digit = Math.max(...data.map(d => d.line)).toString().length;
        return data.map(d => `${('0'.repeat(digit) + d.line).slice(-digit)}:`
            + ` ${d instanceof EmptyLine ? '' : `${d.tag}=${d.value}`}`
        ).join('\n');
    }

}

export namespace DiffLine {
    /**
     * Compare both of 2 entries arrays and generate DiffLine array.
     * @param orig 
     * @param trsl 
     */
    export function diff(orig: Entry[], trsl: Entry[]) {
        return [...new Set([
            ...orig.filter(e => !e.isEmpty()).filter(e => !e.is_comment).map(e => e.tag),
            ...trsl.filter(e => !e.isEmpty()).filter(e => !e.is_comment).map(e => e.tag),
        ])].map(tag => {
            const or = orig.find(e => tag === e.tag);
            const tr = trsl.find(e => tag === e.tag);

            return new DiffLine(tag, {
                v1: (or != null ? or.value : undefined),
                l1: (or != null ? or.line : -1),
                v2: (tr != null ? tr.value : undefined),
                l2: (tr != null ? tr.line : -1),
            });
        });
    }
}
