
interface GroupStatus {
    membersInChat: number;
    membersInGame: number;
    membersOnline: number;
}

export interface SteamData {
    groupID: number;
    groupName: string;
    groupURL: URL;
    headline: string;
    summary: string;
    avatarIcon: URL;
    avatarMedium: URL;
    avatarFull: URL;
    memberCount: number;
    status: GroupStatus;
    members: Member[];
}

interface Member {
    steamid: string;
    communityvisibilitystate: number;
    profilestate: number;
    personaname: string;
    profileurl: URL;
    avatar: URL;
    avatarmedium: URL;
    avatarfull: URL;
    avatarhash: string;
    lastlogoff: number;
    personastate: number;
    primaryclanid: string;
    timecreated: number;
    personastateflags: number;
}