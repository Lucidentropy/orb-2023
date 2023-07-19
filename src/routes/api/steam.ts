import axios from "axios";
import { parseStringPromise } from "xml2js";

export const GET = async () => {
    try {
        const response = await axios.get("https://steamcommunity.com/groups/orb/memberslistxml/", { responseType: 'text' });
        const data = await parseStringPromise(response.data);
        return { body: data };
    } catch (error) {
        console.error(error);
        return { status: 500, body: { error: 'Failed to fetch XML' } };
    }
};