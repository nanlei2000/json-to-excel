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
    public async getRandomChain(seedWord: string): Promise<string[]> {
        const allWords = await new Promise<Pick<IdiomTable.Fields,
            'word' | 'id' | 'next_id_str'>[]>((resolve, reject) => {
                const allWordsSql = `SELECT ${field("word", 'id', 'next_id_str')} FROM ${IdiomTable.name}`;
                connection.query(allWordsSql, (err, result: any[]) => {
                    if (err) { reject(err); };
                    resolve(result);
                });
            });
        const idInfoMap: IdInfoMap = new Map<number, [string, number[]]>();
        let seedId = -1;
        for (const { id, word, next_id_str } of allWords) {
            if (seedId < 0 && word === seedWord) {
                seedId = id;
            }
            idInfoMap.set(id, [word, next_id_str.split(',').map(Number)]);
        }
        if (seedId < 0) {
            throw new Error(`「${seedWord}」没有在库中`);
        }
        return findLongestChain(seedId, idInfoMap);
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
    let maxLoopCount = 20000;
    function loop(id: number, chain: number[]): number[] {
        maxLoopCount--;
        if (maxLoopCount < 0) {
            return chain;
        }
        const nextWordIdList = (map.get(id)?.[1] ?? []).filter(id => !chain.includes(id));
        if (!nextWordIdList.length) {
            return chain;
        } else {
            let maxLength = -1;
            let longestChain: number[] = [];
            for (const id of nextWordIdList) {
                const currentChain = loop(id, [...chain, id]);
                const currentLength = currentChain.length;
                if (currentLength > maxLength) {
                    maxLength = currentLength;
                    longestChain = currentChain;
                }
            }
            return longestChain;
        }
    }
    return loop(id, []).map(id => map.get(id)?.[0]!);
}
