/**
 * 实现功能
 * 1 ：得到候选成语
 */

export interface Item {
    derivation: string;
    example: string;
    explanation: string;
    pinyin: string;
    word: string;
    abbreviation: string;
}
import mysql from 'mysql';
import fs from 'fs-extra';
import { fieldHelper } from '../src/shared';
import { IdiomTable } from '../src/database/mysql';
import path from 'path';
import commandLineArgs from 'command-line-args';
const confPath = path.join(__dirname, '../env/mysql.json');
export const baseConf = fs.readJSONSync(confPath);

// Setup command line options
const options = commandLineArgs([
    {
        name: 'env',
        alias: 'e',
        defaultValue: 'production',
        type: String,
    },
]);
if (!baseConf) {
    throw new Error('找不到' + confPath);
}
const config = {
    ...(baseConf[options.env]),
    database: 'fun_api',
};
export const connection = mysql.createConnection({
    ...config, user: 'root',
    insecureAuth: true, debug: true, trace: true
});
console.log("→: connection", connection);
const field = fieldHelper<IdiomTable.Fields>();
function setRow(row: Item): Promise<unknown> {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO ${IdiomTable.name} SET
            ${field("derivation", row.derivation)},
            ${field("example", row.example)},
            ${field("explanation", row.explanation)},
            ${field("pinyin", row.pinyin)},
            ${field("word", row.word)},
            ${field("abbr", row.abbreviation)}
        `, (error) => {
            if (error) { reject(error); }
            resolve();
        });
    });
}
const json: Item[] = fs.readJSONSync('./idiom.json');

Promise.all(json.map(v => setRow(v)))
    .then(() => {
        console.log('成功');
    })
    .catch((err) => {
        console.log(err.message);
    }
    ).finally(() => {
        connection.destroy();
        process.exit(0);
    });
