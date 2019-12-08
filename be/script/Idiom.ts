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
import { escape } from '../src/shared'
export const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'kh152572515',
    database: 'fun_api'
});

function setRow(row: Item): Promise<unknown> {
    return new Promise((resolve, reject) => {
        connection.query(
            escape`INSERT INTO idiom SET
            derivation=${row.derivation},
            example=${row.example},
            explanation=${row.explanation},
            pinyin=${row.pinyin},
            word=${row.word},
            abbr=${row.abbreviation}
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
    }).catch((err) => {
        console.log(err.message);
    }
    )



