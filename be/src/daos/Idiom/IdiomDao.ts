import { connection, IdiomTable } from '../../database/mysql';
import _ from 'lodash';
const field = IdiomTable.field;
const fieldV = IdiomTable.fieldV;
type IdInfoMap = Map<number, [string, number[]]>;

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
        const allWords = await new Promise<Pick<IdiomTable.Fields,
            'word' | 'id' | 'next_id_str'>[]>((resolve, reject) => {
                const allWordsSql = `SELECT ${field("word", 'id', 'next_id_str')} FROM ${IdiomTable.name}`;
                connection.query(allWordsSql, (err, result: any[]) => {
                    if (err) { reject(err); };
                    resolve(result);
                });
            });
        const srcRow = await new Promise<Pick<IdiomTable.Fields,
            'id'>[]>((resolve, reject) => {
                const allWordsSql = `SELECT ${field('id')} FROM ${IdiomTable.name}
                WHERE ${fieldV('word', word)}`;
                connection.query(allWordsSql, (err, result: any[]) => {
                    if (err) { reject(err); };
                    resolve(result);
                });
            });

        const idInfoMap: IdInfoMap = new Map<number, [string, number[]]>();
        for (const { id, word, next_id_str } of allWords) {
            idInfoMap.set(id, [word, next_id_str.split(',').map(Number)]);
        }
        return findLongestChain(srcRow[0].id, idInfoMap);
    }
}

function findRandomChain(id: number, map: IdInfoMap): string[] {
    function loop(id: number, chain: number[]): number[] {
        const nextWordIdList = (map.get(id)?.[1] ?? []).filter(id => !chain.includes(id));
        if (!nextWordIdList.length) {
            return chain;
        } else {
            const randomId = nextWordIdList[_.random(0, nextWordIdList.length - 1)];
            return loop(randomId, [...chain, randomId]);
        }
    }
    return loop(id, []).map(id => map.get(id)?.[0]!);
}
function findLongestChain(id: number, map: IdInfoMap): string[] {
    function loop(id: number, chain: number[]): number[] {
        const nextWordIdList = (map.get(id)?.[1] ?? []).filter(id => !chain.includes(id));
        if (!nextWordIdList.length) {
            return chain;
        } else {
            const randomId = nextWordIdList[_.random(0, nextWordIdList.length - 1)];
            let maxLength = -1;
            let bestId = -1;
            for (const id of nextWordIdList) {
                const words = loop(id, [...chain, id]);
                const currentLength = words.length;
                if (currentLength > maxLength) {
                    maxLength = currentLength;
                    bestId = id;
                }
            }
            return loop(bestId, [...chain, bestId]);
        }
    }
    return loop(id, []).map(id => map.get(id)?.[0]!);
}