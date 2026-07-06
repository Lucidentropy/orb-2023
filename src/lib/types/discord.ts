export interface DiscordGame {
    name: string;
}

export interface DiscordMember {
    id: string;
    username: string;
    avatar_url: string;
    status: string;
    channel_id: string | null;
    self_mute: boolean;
    self_deaf?: boolean;
    game?: DiscordGame | null;
}

export interface DiscordChannel {
    id: string;
    name: string;
    position: number;
}

export interface DiscordData {
    id: string;
    name: string;
    instant_invite: string | null;
    presence_count: number;
    channels: DiscordChannel[];
    members: DiscordMember[];
}