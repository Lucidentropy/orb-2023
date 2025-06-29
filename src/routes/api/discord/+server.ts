import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

export async function GET() {
    const guild = process.env.DISCORD_GUILD_ID;
    const response = await axios.get(`https://discordapp.com/api/guilds/${guild}/widget.json`);

    return new Response(JSON.stringify(response.data), { status: 200 });
}

