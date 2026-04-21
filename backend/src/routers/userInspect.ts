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

interface SearchRow {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
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

const SEARCH_CACHE_TTL_MS = 30 * 1000;
const SEARCH_CACHE_MAX_ENTRIES = 500;

const searchCache = new Map<string, { expiresAt: number; rows: SearchRow[] }>();
const inflightSearches = new Map<string, Promise<SearchRow[]>>();

async function searchUsers(term: string): Promise<SearchRow[]> {
    const key = term.toLowerCase().trim();

    const cached = searchCache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.rows;
    if (cached) searchCache.delete(key);

    const existing = inflightSearches.get(key);
    if (existing) return existing;

    const promise = (async () => {
        const token = await getAdminAccessToken();
        const url = `${config.KEYCLOAK_URL}/admin/realms/${config.KEYCLOAK_REALM}/users`;
        const response = await axios.get<KeycloakAdminUser[]>(url, {
            params: { search: term, max: 25, briefRepresentation: true },
            headers: { Authorization: `Bearer ${token}` },
        });

        const rows: SearchRow[] = response.data.map(u => ({
            id: u.id,
            first_name: u.firstName ?? "",
            last_name: u.lastName ?? "",
            email: u.email ?? "",
        }));

        if (searchCache.size >= SEARCH_CACHE_MAX_ENTRIES) {
            const oldestKey = searchCache.keys().next().value;
            if (oldestKey !== undefined) searchCache.delete(oldestKey);
        }
        searchCache.set(key, { expiresAt: Date.now() + SEARCH_CACHE_TTL_MS, rows });

        return rows;
    })().finally(() => {
        inflightSearches.delete(key);
    });

    inflightSearches.set(key, promise);
    return promise;
}

userInspectRouter.get(
    '/search',
    requireSuperUser,
    validateQueryParams(searchQueryParamsSchema),
    async (req: AuthenticatedRequest, res) => {
        try {
            const searchTerm = req.query.q! as string;
            const rows = await searchUsers(searchTerm);
            return res.status(200).json({ rows });
        } catch (error) {
            console.error('Keycloak user search failed', error);
            return res.status(500).json({ message: 'User search failed' });
        }
    })
