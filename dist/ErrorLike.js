"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ErrorLike extends Error {
    inspect() {
        return this.stack;
    }
}
exports.ErrorLike = ErrorLike;
//# sourceMappingURL=ErrorLike.js.map