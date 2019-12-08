import { connection, IdiomTable } from '../../database/mysql';
const field = IdiomTable.field;
const fieldV = IdiomTable.fieldV;

export class IdiomDao {
    /** @throws IOException */
    public async getAll(word: string): Promise<Pick<IdiomTable.Fields, 'word'>[]> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT ${field("word")} from ${IdiomTable.name}
            WHERE ${field("word")} REGEXP '^${word[word.length - 1]}'
            `
            connection.query(sql, (err, result: Pick<IdiomTable.Fields, 'word'>[]) => {
                if (err) { reject(err) };
                resolve(result);
            })
        })
    }
}
