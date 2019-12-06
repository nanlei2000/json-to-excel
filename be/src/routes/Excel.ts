
import { logger } from '@shared';
import { Response, Router } from 'express';
import { BAD_REQUEST, CREATED } from 'http-status-codes';
import { paramMissingError } from '@shared';
import { Request } from 'express-serve-static-core';
import { ExcelDao } from 'src/daos/Excel/ExcelDao';

// Init shared
const router = Router();
const excelDao = new ExcelDao();

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
        // json.add();
        if (!json) {
            return res.status(BAD_REQUEST).json({
                error: paramMissingError,
            });
        }
        const filePath: string | undefined = await excelDao.add(json);
        if (!filePath) {
            return res.status(BAD_REQUEST).json(
                {
                    error: '生成失败'
                }
            )
        }
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
