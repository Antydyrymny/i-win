import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// import getSocket from './getSocket';

const baseUrl =
    import.meta.env.VITE_ENV === 'DEV'
        ? import.meta.env.VITE_DEV_URL
        : import.meta.env.VITE_SERVER_URL;

// const socket = getSocket();

const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl,
    }),
    tagTypes: ['AllRooms', 'userId'],
    endpoints: () => ({}),
});

export default apiSlice;
