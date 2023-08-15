import axios from 'axios';
import dotenv from 'dotenv';
import { userData } from '$store/user';

dotenv.config();

export async function handleAuthCode(code: string) {
    try {
        const params = new URLSearchParams();
        params.append('client_id', process.env.DISCORD_CLIENT_ID);
        params.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', process.env.DISCORD_REDIRECT_URI);
        params.append('scope', 'identify email');

        const response = await axios.post('https://discord.com/api/oauth2/token', params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        const { access_token, token_type } = response.data;
        const userDataResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${token_type} ${access_token}`
            }
        })

        userData.set(userDataResponse.data);

        return new Response(null, {
            headers: {
                location: '/mcp',
            },
            status: 302,
        });
    } catch (error) {
        console.error(code, error.response.data);
        // console.error('Error during Discord OAuth2 flow:', error.config, error.response.status, error.response.statusText, error.code , code);
        const err = new Error('An error occurred during Discord OAuth2 authentication.');
        throw err;
    }
}
