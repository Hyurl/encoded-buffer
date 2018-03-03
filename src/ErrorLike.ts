export class ErrorLike extends Error {
    inspect() {
        return this.stack;
    }
}