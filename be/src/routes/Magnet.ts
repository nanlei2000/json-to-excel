
import { logger, currentUrl } from '@shared';
import { Router } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import { Request } from 'express-serve-static-core';
import { Res } from 'src/shared/Response';
import { MagnetDao } from '@daos';

// Init shared
const router = Router();
const magnetDao = new MagnetDao();

namespace AddMagnet {
    interface ResData {
        // url: string
    }
    const magnetReg: RegExp = /magnet:\?xt=urn:btih:[a-zA-Z0-9]*/g
    export async function coreMid(
        req: Request<never, never, Record<'url', string | undefined>>,
        res: Res<any>
    ): Promise<Res<ResData>> {
        try {
            const { url } = req.body;
            if (url && magnetReg.test(url)) {
                const metaData = await magnetDao.getMetaData(url);
                return res.json({
                    code: 200,
                    data: metaData,
                    msg: "添加成功"
                })
            } else {
                return res.json({
                    code: BAD_REQUEST,
                    msg: "不合法的json"
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

router.post('/add', AddMagnet.coreMid);
export const MagnetRouter = router;
