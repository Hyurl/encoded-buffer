"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Error extends global.Error {
    inspect() {
        return this.stack;
    }
}
exports.Error = Error;
//# sourceMappingURL=Error.js.map