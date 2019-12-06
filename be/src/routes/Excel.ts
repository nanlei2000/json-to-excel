
import { UserDao } from '@daos';
import { logger } from '@shared';
import { Response, Router, Express } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { paramMissingError } from '@shared';
import { ParamsDictionary, Dictionary, Request } from 'express-serve-static-core';

// Init shared
const router = Router();
const userDao = new UserDao();

// /******************************************************************************
//  *                      Get All Users - "GET /api/users/all"
//  ******************************************************************************/

// router.get('/all', async (req: Request, res: Response) => {
//     try {
//         const users = await userDao.getAll();
//         return res.status(OK).json({users});
//     } catch (err) {
//         logger.error(err.message, err);
//         return res.status(BAD_REQUEST).json({
//             error: err.message,
//         });
//     }
// });

/******************************************************************************
 *                       Add One - "POST /api/users/add"
 ******************************************************************************/

router.post('/add', async (req: Request<never, never, Record<'json', string>>, res: Response) => {
    try {
        const { json } = req.body;
        json.add();
        if (!json) {
            return res.status(BAD_REQUEST).json({
                error: paramMissingError,
            });
        }
        await Promise.resolve();
        return res.status(CREATED).json(
            {
                code: 200,
                msg: '创建成功',
                data: {
                    file: json,
                },
            },
        ).end();
    } catch (err) {
        logger.error(err.message, err);
        return res.status(BAD_REQUEST).json({
            error: err.message,
        });
    }
});
export const ExcelRouter = router;
