import mysql from 'mysql';
import { logger, fieldHelper } from '@shared';
import fs from 'fs-extra';
import path from 'path';
import { Dictionary } from 'express-serve-static-core';
interface BaseConf {
    host: string,
    user: string,
    password: string,
}
const confPath = path.join(__dirname, '../../env/mysql.json');
export const baseConf = fs.readJSONSync(confPath);
if (!baseConf) {
    throw new Error('找不到' + confPath);
}

export const connection = mysql.createConnection({
    ...(baseConf as Dictionary<BaseConf>)[process.env.NODE_ENV!],
    database: 'fun_api'
});
connection.query('SELECT 1', (error) => {
    if (error) { throw error; }
    // connected!
    logger.info('mysql root 用户连接成功');
});

export namespace IdiomTable {
    export const name = "idiom";
    export interface Fields {
        /** 出处 */
        derivation: string;
        example: string;
        explanation: string;
        pinyin: string;
        word: string;
        /** 拼音简写 */
        abbr: string;
        id: number;
        next_id_str: string;
    }
    export const fieldV = fieldHelper<Fields>();
    export const field = (...key: (keyof Fields)[]) => key.join(',');
}
