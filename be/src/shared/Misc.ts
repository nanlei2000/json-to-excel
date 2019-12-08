import { logger } from './Logger';
import mysql from 'mysql';
export const paramMissingError = 'One or more of the required parameters was missing.';

export const pErr = (err: Error) => {
    if (err) {
        logger.error(err);
    }
};

export const getRandomInt = () => {
    return Math.floor(Math.random() * 1_000_000_000_000);
};

export const currentUrl = `http://${process.env.HOST}:${process.env.PORT}`;

export function escape(strings: TemplateStringsArray, ...values: any[]): string {

    return strings.map((s, index) =>
        (index < values.length ? `${s}${mysql.escape(values[index])}` : s))
        .join('')
};
