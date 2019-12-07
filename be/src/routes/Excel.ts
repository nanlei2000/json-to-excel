
import { logger, currentUrl } from '@shared';
import { Router } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import { Request } from 'express-serve-static-core';
import { ExcelDao } from 'src/daos/Excel/ExcelDao';
import { Res } from 'src/shared/Response';

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

interface ExcelAddResData {
    file: string,
}
/**
 *  效验json
 */
function isValidJSONForExcel(str: string): unknown[][] | undefined {
    try {
        const parsed: unknown = JSON.parse(str);
        if (Array.isArray(parsed) && Array.isArray(parsed[0])) {
            return parsed;
        } else {
            return undefined;
        }
    } catch (error) {
        return undefined;
    }
}

const addExcel = async (req: Request<never, never, Record<'json', string>>, res: Res<ExcelAddResData>) => {
    try {
        const parsed = isValidJSONForExcel(req.body.json);
        if (parsed === undefined) {
            return res.json({
                msg: 'json不合法',
                code: BAD_REQUEST,
            });
        }
        const filePath: string | undefined = await excelDao.add(parsed);
        if (!filePath) {
            throw new Error('生成excel失败，请重试')
        }
        return res.json({
            code: 200,
            msg: '创建成功',
            data: {
                file: currentUrl + filePath,
            },
        });
    } catch (err) {
        logger.error(err.message, err);
        return res.json({
            msg: err.message,
            code: BAD_REQUEST,
        });
    }
};
router.post('/add', addExcel);
export const ExcelRouter = router;
