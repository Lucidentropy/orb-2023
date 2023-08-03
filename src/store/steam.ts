import type { IncomingMessage } from 'http';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

export async function get(req: IncomingMessage) {
    const url = 'https://steamcommunity.com/groups/orb/memberslistxml/';

    try {
        const response = await fetch(url);
        const data = await response.text();

        // Define the file path
        const filePath = path.resolve('static/json/steam.json');

        // Write the data to a file
        fs.writeFile(filePath, data, (err) => {
            if (err) throw err;
            console.log('Data saved to file');
        });

        return {
            body: {
                message: 'Data fetched and saved to file',
            },
        };
    } catch (error) {
        return {
            status: 500,
            body: {
                error: 'Failed to fetch data',
            },
        };
    }
}
