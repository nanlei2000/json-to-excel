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
import { fieldHelper } from '../src/shared'
import { IdiomTable } from '../src/database/mysql'
export const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'kh152572515',
    database: 'fun_api'
});
const field = fieldHelper<IdiomTable>();
function setRow(row: Item): Promise<unknown> {
    return new Promise((resolve, reject) => {
        connection.query(
            `INSERT INTO idiom SET
            ${field("derivation", row.derivation)},
            ${field("example", row.example)},
            ${field("explanation", row.explanation)},
            ${field("pinyin", row.pinyin)},
            ${field("word", row.word)},
            ${field("abbr", row.abbreviation)}
        `, (error) => {
            if (error) { reject(error); }
            resolve()
        });
    })
}
const json: Item[] = fs.readJSONSync('./idiom.json');

Promise.all(json.map(v => setRow(v)))
    .then(() => {
        console.log('成功')
    })
    .catch((err) => {
        console.log(err.message);
    }
    ).finally(() => {
        connection.destroy();
        process.exit(0);
    });
