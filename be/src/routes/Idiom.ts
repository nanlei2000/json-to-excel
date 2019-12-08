
import { logger, currentUrl } from '@shared';
import { Router } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import { Request } from 'express-serve-static-core';
import { Res } from 'src/shared/Response';
import { IdiomDao } from '@daos';

// Init shared
const router = Router();
const idiomDao = new IdiomDao();

namespace GetAll {
    export const path = '/get-all';
    interface ResData {
        words: string[]
    }
    const wordReg: RegExp = /^[\u4e00-\u9fa5]{4,}$/;
    type Query = Record<'word', string | undefined>;
    export async function coreMid(
        req: Request,
        res: Res<ResData>
    ): Promise<Res<ResData>> {
        try {
            const { word } = req.query as Query;
            if (word && wordReg.test(word)) {
                const rows = await idiomDao.getAll(word);
                return res.json({
                    code: 200,
                    data: {
                        words: rows.map(v => v.word)
                    },
                    msg: "查询成功"
                })
            } else {
                return res.json({
                    code: BAD_REQUEST,
                    msg: "无效的成语"
                })
            }

        } catch (err) {
            logger.error(err.message, err);
            return res.json({
                msg: err.message,
                code: BAD_REQUEST,
            });
        }
    }
}

router.get(GetAll.path, GetAll.coreMid);
export const IdiomRouter = router;
