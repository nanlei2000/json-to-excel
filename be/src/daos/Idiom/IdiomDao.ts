import { connection, IdiomTable } from '../../database/mysql';
import _ from 'lodash';
import { redis } from '../../database/redis';
import { md5 } from '@shared';
import { setTimeout } from 'timers';
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
    public async getLongestChain(seedWord: string, backSteps: number): Promise<string[] | undefined> {
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
        const longestChain = findLongestChainR(seedId, idInfoMap!, backSteps);
        // redis.set(key, longestChain.join(','), 'EX', 24 * 3600);
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

async function findLongestChainR(id: number, map: IdInfoMap, backSteps: number = 20): Promise<string[]> {
    /** @see https://2ality.com/2014/04/call-stack-size.html */
    let maxLoopCount = 5000;
    /** 为什么递归结束最后一项是 0  */
    function loop(id: number, chain: number[]): number[] {
        maxLoopCount--;
        if (maxLoopCount < 0) {
            return chain;
        }
        const nextWordIds = map.get(id)?.[1];
        if (nextWordIds === undefined || nextWordIds.length === 0) {
            return chain;
        } else {
            let maxLength = -1;
            let longestChain: number[] = [];
            for (let i = 0; i < nextWordIds!.length; i++) {
                if (chain.includes(nextWordIds[i]) === false) {
                    const currentChain = loop(nextWordIds[i], [...chain, nextWordIds[i]]);
                    const currentLength = currentChain.length;
                    if (currentLength > maxLength) {
                        maxLength = currentLength;
                        longestChain = currentChain;
                    }
                }
            }
            return longestChain;
        }
    }
    /** @see https://snyk.io/blog/nodejs-how-even-quick-async-functions-can-block-the-event-loop-starve-io/ */
    const maxRetryCount = 500;
    let res = [id];
    let lastTailId = id;
    for (let i = 0; i < maxRetryCount; i++) {
        maxLoopCount = 7000;
        res = loop(res[res.length - 1], res);

        if (i === maxRetryCount - 1 || lastTailId === res[res.length - backSteps]) {
            console.log(i);
            break;
        }
        lastTailId = res[res.length - backSteps];
        res = res.slice(0, res.length - backSteps);
        await new Promise((r) => setImmediate(r, 0));
    }
    return res.map(id => map.get(id)?.[0]!);
}
function getRandomInt(low: number, up: number): number {
    const range = Math.round(up - low);
    const base = Math.random() * range + (low - 0.5);
    return Math.round(base);
}
