const usingMockDb = (process.env.USE_MOCK_DB || '').toLowerCase();
let userDaoPath = './User/UserDao';

if (usingMockDb === 'true') {
    userDaoPath += '.mock';
}

// tslint:disable:no-var-requires
export const { UserDao } = require(userDaoPath);
export { ExcelDao } from './Excel/ExcelDao';
export { MagnetDao } from './Magnet/MagnetDao';
export { IdiomDao } from './Idiom/IdiomDao';
