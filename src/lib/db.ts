import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export async function getConnection() {
    const dbUrl = process.env['CLEARDB_DATABASE_URL'];
    const parsedUrl = new URL(dbUrl);

    const config = {
        host: parsedUrl.hostname,
        user: parsedUrl.username,
        password: parsedUrl.password,
        database: parsedUrl.pathname.substring(1),
        port: parseInt(parsedUrl.port) || undefined,
        multipleStatements: true
    };

    const connection = await mysql.createConnection(config);
    return connection;
}