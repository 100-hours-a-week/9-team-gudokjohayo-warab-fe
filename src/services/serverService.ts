import api from "../api/config";

// Interface for server response from API
export interface ServerResponse {
    message: string;
    data: {
        servers: ServerInfo[];
    };
}

// Interface for individual server info
export interface ServerInfo {
    server_id: number;
    user_id: number;
    discord_url: string;
    name: string;
    description: string;
    member_count: number;
    icon_url: string;
    created_at: string;
    expires_at: string | null;
}

// Interface for user servers response
export interface UserServerResponse {
    message: string;
    data: {
        servers: UserServerInfo[];
    };
}

// Interface for user server info
export interface UserServerInfo {
    server_id: number;
    discord_url: string;
    game_name: string;
    game_id: number;
    created_at: string;
    expires_at: string | null;
}

// Function to get servers for a specific game
export const getGameServers = async (gameId: string) => {
    try {
        const response = await api.get<ServerResponse>(
            `/games/${gameId}/server`
        );
        return response.data.data.servers;
    } catch (error) {
        console.error("Error fetching game servers:", error);
        throw error;
    }
};

// Function to get all servers for a user
export const getUserServers = async () => {
    try {
        const response = await api.get<UserServerResponse>("/users/server");
        return response.data.data.servers;
    } catch (error) {
        console.error("Error fetching user servers:", error);
        throw error;
    }
};

// Function to add a new server
export const addServer = async (
    gameId: string,
    serverData: { url: string }
) => {
    try {
        const response = await api.post(`/games/${gameId}/server`, serverData);
        return response.data;
    } catch (error) {
        console.error("Error adding server:", error);
        throw error;
    }
};

// Function to delete a server
export const deleteServer = async (gameId: string, serverId: number) => {
    try {
        const response = await api.delete(
            `/games/${gameId}/server/${serverId}`
        );
        return response.data;
    } catch (error) {
        console.error("Error deleting server:", error);
        throw error;
    }
};
