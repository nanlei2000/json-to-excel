import excel from 'xlsx';
import uuid from 'uuid';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
export interface IExcelDao {
    // getAll: () => Promise<IUser[]>;
    add: (json: string) => Promise<string | undefined>;
    // update: (user: IUser) => Promise<void>;
    // delete: (id: number) => Promise<void>;
}

export class ExcelDao implements IExcelDao {
    public async add(json: string): Promise<string | undefined> {
        const id = uuid.v4();
        const filePath = path.resolve(__dirname, `../../public/excel/${id}.xlsx`);
        if (await promisify(fs.exists)(filePath)) {
            return undefined;
        } else {
            let data = 'a,b,c\n1,2,3'.split('\n').map(function (x) { return x.split(','); });
            const ws = excel.utils.aoa_to_sheet(data);
            const wb = excel.utils.book_new();
            excel.utils.book_append_sheet(wb, ws, 'SheetJS');
            const buf = excel.write(wb, { type: 'buffer', bookType: 'xlsx' });
            await promisify(fs.writeFile)(filePath, buf);
            return filePath;
        }
    }

}
