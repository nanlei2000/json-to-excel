"use strict";
/**
 * 实现功能
 * 1 ：得到候选成语
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql_1 = __importDefault(require("mysql"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const shared_1 = require("../dist/shared");
const mysql_2 = require("../dist/database/mysql");
const path_1 = __importDefault(require("path"));
const command_line_args_1 = __importDefault(require("command-line-args"));
const confPath = path_1.default.join(__dirname, '../env/mysql.json');
exports.baseConf = fs_extra_1.default.readJSONSync(confPath);
// Setup command line options
const options = command_line_args_1.default([
    {
        name: 'env',
        alias: 'e',
        defaultValue: 'production',
        type: String,
    },
]);
if (!exports.baseConf) {
    throw new Error('找不到' + confPath);
}
const config = {
    ...(exports.baseConf[options.env]),
    database: 'fun_api',
};
exports.connection = mysql_1.default.createConnection({
    ...config
});
console.log("→: connection", exports.connection);
const field = shared_1.fieldHelper();
function setRow(row) {
    return new Promise((resolve, reject) => {
        exports.connection.query(`INSERT INTO ${mysql_2.IdiomTable.name} SET
            ${field("derivation", row.derivation)},
            ${field("example", row.example)},
            ${field("explanation", row.explanation)},
            ${field("pinyin", row.pinyin)},
            ${field("word", row.word)},
            ${field("abbr", row.abbreviation)}
        `, (error) => {
            if (error) {
                reject(error);
            }
            resolve();
        });
    });
}
const json = fs_extra_1.default.readJSONSync('./idiom.json');
Promise.all(json.map(v => setRow(v)))
    .then(() => {
        console.log('成功');
    })
    .catch((err) => {
        console.log(err.message);
    }).finally(() => {
        exports.connection.destroy();
        process.exit(0);
    });
