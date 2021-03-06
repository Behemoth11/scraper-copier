"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ensurePath_1 = require("./ensurePath");
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const Logger_1 = __importDefault(require("../classes/Logger"));
/**
 * Creates a sqlite database on the given path
 *
 * @param dbPath
 * @param cb
 * @returns
 */
const createSqliteDb = (dbPath, cb) => __awaiter(void 0, void 0, void 0, function* () {
    let db = null;
    if (!(yield (0, ensurePath_1.ensurePath)(path_1.default.dirname(dbPath))))
        console.log(Logger_1.default.color(`Could not create directory at path ${dbPath}`, "FgRed"));
    yield new Promise((resolve) => {
        db = new sqlite3_1.default.Database(dbPath, (err) => {
            resolve();
            if (cb)
                return cb(err);
            if (err) {
                console.error(err);
            }
            console.log("\nConnected to database.... Ready to rock 🤘");
        });
    });
    return db;
});
exports.default = createSqliteDb;
