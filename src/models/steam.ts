import axios from 'axios';

// Define the URL
const url = 'https://steamcommunity.com/groups/orb/memberslistxml/';

export async function fetchSteamData() {
    const response = await axios.get(url);
    return response.data;
}