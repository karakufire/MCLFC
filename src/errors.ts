export class NotEnoughArgs extends Error {
    constructor(message?: string) {
        super(message);
    }
}

export class CouldNotParse extends Error {
    constructor(path: string) {
        super();
        this.message = `${path} is illegal file`;
    }
}

export class NoSuchFile extends Error {
    constructor(path: string) {
        super();
        this.message = `No such file or directory: ${path}`;
    }
}