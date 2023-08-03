import axios from 'axios';

// Define the URL
const url = 'https://steamcommunity.com/groups/orb/memberslistxml/?xml=1';

export async function fetchSteamData() {
    const response = await axios.get(url);
    return {
        body: response.data
    };
}
