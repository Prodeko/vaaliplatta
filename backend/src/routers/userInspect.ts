import { Router } from "express";
import { AuthenticatedRequest, requireSuperUser } from "../middleware/auth";
import { config } from "../config";
import { validateQueryParams } from "../middleware/validators";
import { z } from "zod";
import axios from "axios";

export const userInspectRouter = Router();

const searchQueryParamsSchema = z.object({
    q: z.string().min(3)
});

interface KeycloakAdminUser {
    id: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
}

interface TokenResponse {
    access_token: string;
    expires_in: number;
}

const TOKEN_EXPIRY_BUFFER_MS = 30 * 1000;

let cachedAdminToken: { token: string; expiresAt: number } | null = null;

async function getAdminAccessToken(): Promise<string> {
    if (cachedAdminToken && cachedAdminToken.expiresAt > Date.now()) {
        return cachedAdminToken.token;
    }

    const tokenUrl = `${config.KEYCLOAK_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: config.KEYCLOAK_ADMIN_CLIENT_ID,
        client_secret: config.KEYCLOAK_ADMIN_CLIENT_SECRET,
    });

    const response = await axios.post<TokenResponse>(tokenUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    cachedAdminToken = {
        token: response.data.access_token,
        expiresAt: Date.now() + response.data.expires_in * 1000 - TOKEN_EXPIRY_BUFFER_MS,
    };

    return cachedAdminToken.token;
}

userInspectRouter.get(
    '/search',
    requireSuperUser,
    validateQueryParams(searchQueryParamsSchema),
    async (req: AuthenticatedRequest, res) => {
        try {
            const searchTerm = req.query.q! as string;
            const token = await getAdminAccessToken();

            const url = `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`;
            const response = await axios.get<KeycloakAdminUser[]>(url, {
                params: { search: searchTerm, max: 25 },
                headers: { Authorization: `Bearer ${token}` },
            });

            const rows = response.data.map(u => ({
                id: u.id,
                first_name: u.firstName ?? "",
                last_name: u.lastName ?? "",
                email: u.email ?? "",
            }));

            return res.status(200).json({ rows });
        } catch (error) {
            console.error('Keycloak user search failed', error);
            return res.status(500).json({ message: 'User search failed' });
        }
    })
