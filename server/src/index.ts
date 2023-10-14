import dotenv from 'dotenv';
import server from './app';

dotenv.config();

const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Listening to PORT: ${port}`);
});
