import type { LocalStorageSchema } from '../types/types';

export const setTypedStorageItem = <T extends keyof LocalStorageSchema>(
    key: T,
    value: LocalStorageSchema[T]
): void => {
    window.localStorage.setItem(key, JSON.stringify(value));
};

export const getTypedStorageItem = <T extends keyof LocalStorageSchema>(
    key: T
): LocalStorageSchema[T] | null => {
    const stringifiedItem = window.localStorage.getItem(key);
    return stringifiedItem
        ? (JSON.parse(stringifiedItem) as LocalStorageSchema[T])
        : null;
};
