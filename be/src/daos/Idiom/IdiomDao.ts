import { connection, IdiomTable } from '../../database/mysql';
import _ from 'lodash';
import { redis } from 'src/database/redis';
import { md5 } from '@shared';
const field = IdiomTable.field;
type IdInfoMap = Map<number, [string, number[]]>;
type AllWords = Pick<IdiomTable.Fields, "word" | "id" | "next_id_str">[];

export class IdiomDao {
    private allWordsKey: string = ['IdiomDao', 'allWords'].join(':');
    private idInfoMapKey: string = ['IdiomDao', 'idInfoMap'].join(':');
    private longestChainKeys: string[] = ['IdiomDao', 'longestChain'];
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
    public async getLongestChain(seedWord: string): Promise<string[] | undefined> {
        const key = [...this.longestChainKeys, md5(seedWord)].join(":");
        const redisRes = await redis.get(key);
        if (redisRes) {
            return redisRes.split(',');
        }


        const [allWords, idInfoMap] = await this.setMapCache();
        const seedId = allWords.find(v => v.word === seedWord)?.id ?? -1;
        if (seedId < 0) {
            return undefined;
        }
        const longestChain = findLongestChain(seedId, idInfoMap!);
        redis.set(key, longestChain.join(','), 'EX', 24 * 3600);
        return longestChain;
    }
    private async setMapCache(): Promise<[AllWords, IdInfoMap]> {
        const allWordsFromSql = await new Promise<Pick<IdiomTable.Fields,
            'word' | 'id' | 'next_id_str'>[]>((resolve, reject) => {
                const allWordsSql = `SELECT ${field("word", 'id', 'next_id_str')} FROM ${IdiomTable.name}`;
                connection.query(allWordsSql, (err, result: any[]) => {
                    if (err) { reject(err); };
                    resolve(result);
                });
            });
        const idInfoMapFromSql: IdInfoMap = new Map<number, [string, number[]]>();
        for (const { id, word, next_id_str } of allWordsFromSql) {
            idInfoMapFromSql.set(id, [word, next_id_str.split(',').map(Number)]);
        }
        return [allWordsFromSql, idInfoMapFromSql];
    }
}

function findLongestChain(id: number, map: IdInfoMap): string[] {
    /** @see https://2ality.com/2014/04/call-stack-size.html */
    let maxLoopCount = 16000;
    function loop(id: number, chain: Set<number>): Set<number> {
        maxLoopCount--;
        if (maxLoopCount < 0) {
            return chain;
        }
        const nextWordIdList = (map.get(id)?.[1] ?? []).filter(id => !chain.has(id));
        if (!nextWordIdList.length) {
            return chain;
        } else {
            let maxLength = -1;
            let longestChain: Set<number> = new Set();
            for (const id of nextWordIdList) {
                const currentChain = loop(id, new Set<number>([...chain, id]));
                const currentLength = currentChain.size;
                if (currentLength > maxLength) {
                    maxLength = currentLength;
                    longestChain = currentChain;
                }
            }
            return longestChain;
        }
    }
    return [...loop(id, new Set())].map(id => map.get(id)?.[0]!);
}
