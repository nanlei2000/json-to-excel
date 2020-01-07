import { connection, IdiomTable } from '../../database/mysql';
import _ from 'lodash';
const field = IdiomTable.field;
const fieldV = IdiomTable.fieldV;

export class IdiomDao {
    /** @throws IOException */
    public async getAll(word: string): Promise<Pick<IdiomTable.Fields, 'word'>[]> {
        return new Promise((resolve, reject) => {
            const sql = `SELECT ${field("word")} from ${IdiomTable.name}
            WHERE ${field("word")} REGEXP '^${word[word.length - 1]}'
            `;
            connection.query(sql, (err, result: Pick<IdiomTable.Fields, 'word'>[]) => {
                if (err) { reject(err); };
                resolve(result);
            });
        });
    }
    /** @throws IOException */
    public async getRandomChain(word: string): Promise<string[]> {
        const allWords = await new Promise<Pick<IdiomTable.Fields, 'word'>[]>((resolve, reject) => {
            const allWordsSql = `SELECT ${field("word")} FROM ${IdiomTable.name}
            WHERE ${field('id')} > 0
            `;
            connection.query(allWordsSql, (err, result: Pick<IdiomTable.Fields, 'word'>[]) => {
                if (err) { reject(err); };
                resolve(result);
            });
        });
        return findRandomChain(word, allWords.map(v => v.word));
    }
}

function findRandomChain(head: string, words: string[]): string[] {
    function loop(head_: string, chain: string[]): string[] {
        const nextWords = words.filter(v => v[0] === head_[head_.length - 1] && !chain.includes(v));
        if (!nextWords.length) {
            return chain;
        } else {
            const randomHead = nextWords[_.random(0, nextWords.length - 1)];
            return loop(randomHead, [...chain, randomHead]);
        }
    }
    return loop(head, []);
}
