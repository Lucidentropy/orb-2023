import axios from 'axios';

// Define the URL
const url = 'https://steamcommunity.com/groups/orb/memberslistxml/';

export async function GET() {
    const response = await axios.get(url);
    return {
        body: response.data,
        headers: {
            'Content-Type': 'application/xml'
        }
    };
}
