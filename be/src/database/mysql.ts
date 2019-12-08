import mysql from 'mysql';
import { logger, fieldHelper } from '@shared';
export const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'kh152572515',
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
    }
    export const fieldV = fieldHelper<Fields>()
    export const field = (...key: (keyof Fields)[]) => key.join(',');
}
