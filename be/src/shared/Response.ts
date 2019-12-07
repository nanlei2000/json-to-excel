import { Response } from 'express';
import { Send } from 'express-serve-static-core';

type CommonRes<T> = {
    code: 200,
    msg: string,
    data: T
} | {
    code: number,
    msg: string,
}

export interface Res<T = any> extends Response {
    json: Send<CommonRes<T>, this>
}
