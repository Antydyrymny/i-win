import { UserType } from '../types/types';

export const getOppositeUserType = (lastMoveBy: UserType): UserType =>
    lastMoveBy === 'host' ? 'guest' : 'host';
