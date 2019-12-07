import excel from 'xlsx';
import uuid from 'uuid';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

export class ExcelDao {
    /** @throws IOExceptions */
    public async add(json: unknown[][]): Promise<string | undefined> {
        const id = uuid.v4();
        const filePath = path.resolve(__dirname, `../../public/excel/${id}.xlsx`);
        if (await promisify(fs.exists)(filePath)) {
            return undefined;
        } else {
            const ws = excel.utils.aoa_to_sheet(json);
            const wb = excel.utils.book_new();
            excel.utils.book_append_sheet(wb, ws, 'SheetJS');
            const buf = excel.write(wb, { type: 'buffer', bookType: 'xlsx' });
            await promisify(fs.writeFile)(filePath, buf);
            return `/excel/${id}.xlsx`;
        }
    }

}
