import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { config } from '../config'
import { AuthorizationCode } from 'simple-oauth2';
import axios, { HttpStatusCode } from 'axios';
import jwt from 'jsonwebtoken';
import { DecodedToken } from 'middleware/auth';

export const authRouter = Router();

const base64UrlEncode = (buffer: Buffer): string =>
    buffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

const generateCodeVerifier = (): string => base64UrlEncode(crypto.randomBytes(64));

const generateCodeChallenge = (verifier: string): string =>
    base64UrlEncode(crypto.createHash('sha256').update(verifier).digest());

const generateState = (): string => base64UrlEncode(crypto.randomBytes(32));

const PKCE_STATE_TTL_MS = 10 * 60 * 1000;

const pkceStore = new Map<string, { verifier: string; expiresAt: number }>();

const storePkceVerifier = (state: string, verifier: string) => {
    const expiresAt = Date.now() + PKCE_STATE_TTL_MS;
    pkceStore.set(state, { verifier, expiresAt });
};

const consumePkceVerifier = (state: string): string | undefined => {
    const entry = pkceStore.get(state);

    if (!entry) return undefined;

    if (entry.expiresAt < Date.now()) {
        pkceStore.delete(state);
        return undefined;
    }

    pkceStore.delete(state);
    return entry.verifier;
};

const client = new AuthorizationCode({
    client: {
        id: config.OAUTH_CLIENT_ID,
        secret: config.OAUTH_CLIENT_SECRET,
    },
    auth: {
        tokenHost: config.OAUTH_HOST,
        tokenPath: config.OAUTH_TOKEN_PATH,
        authorizeHost: config.OAUTH_HOST,
        authorizePath: config.OAUTH_AUTHORIZE_PATH,
    },
});

function setAuthCookie(res: Response, token: string): void {
    res.cookie('vaaliplatta_auth_token', token, {
        httpOnly: true,
        secure: process.env.ENV === "PROD",
        sameSite: 'lax',
        maxAge: config.AUTH_COOKIE_MAX_AGE_MILLISECONDS,
    })
}

async function handleLoginWithOauth(req: Request, res: Response) {

    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    storePkceVerifier(state, codeVerifier);

    const authorizationParams = {
        redirect_uri: config.OAUTH_CALLBACK_URI,
        scope: 'read',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
    };

    const authorizationUri = client.authorizeURL(authorizationParams);

    res.redirect(authorizationUri);
}

async function handleLoginMockAuth(req: Request, res: Response) {

    const mockUser = {
        pk: "1",
        email: 'cto@prodeko.org',
        first_name: 'CTO',
        last_name: 'Prodeko',
        is_superuser: true,
    };

    const mockToken = jwt.sign(mockUser, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRATION });

    setAuthCookie(res, mockToken)

    res.redirect(config.FRONTEND_URL)
}

authRouter.get('/oauth2/login', (req, res) => {
    if (config.USE_MOCK_AUTHENTICATION) {
        handleLoginMockAuth(req, res)
    } else {
        handleLoginWithOauth(req, res)
    }
});

export interface UserDetailsResponse {
    pk: number,
    email: string,
    first_name: string,
    last_name: string,
    has_accepted_policies: boolean,
    is_staff: boolean,
    is_superuser: boolean,
}

authRouter.get('/oauth2/callback', async (req, res) => {
    const { code, state } = req.query;

    if (!code || !state) {
        return res.status(HttpStatusCode.BadRequest).json({ message: "Missing OAuth verifier or state" });
    }

    const storedVerifier = consumePkceVerifier(state.toString());

    if (!storedVerifier) {
        return res.status(HttpStatusCode.BadRequest).json({ message: "Invalid or expired OAuth state" });
    }

    const options = {
        code: code?.toString()!,
        redirect_uri: config.OAUTH_CALLBACK_URI,
        code_verifier: storedVerifier,
    };

    try {
        const accessToken = await client.getToken(options);

        const user = await axios.get(
            config.OAUTH_HOST + config.OAUTH_PROFILE_PATH,
            { headers: { Authorization: `Bearer ${accessToken.token.access_token}` } })
            .then(res => res.data as UserDetailsResponse)
            .catch(err => console.error(err))

        const jwt_data = {
            token: accessToken.token.access_token,
            ...user,
        }
        const jwt_token = jwt.sign(jwt_data, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRATION })

        const is_superuser = (!!user?.email) && config.VAALIPLATTA_SUPERUSERS.includes(user.email)

        return res.redirect(`${config.FRONTEND_URL}?token=${jwt_token}&user=${user?.pk.toString() || ""}${is_superuser ? "&superuser=true" : ""}`)
    } catch (error) {
        // @ts-ignore
        console.error('Access Token Error', error.message);
        return res.status(500).json('Authentication failed');
    }
});

authRouter.post('/oauth2/logout', async (req, res) => {
    // TODO separate token revocation
    res.clearCookie("vaaliplatta_auth_token")
    res.status(200).json({ message: "logged out successfully" })
})

authRouter.get('/api/session', async (req, res) => {
    const token = req.cookies?.vaaliplatta_auth_token;

    if (!token) return res.status(HttpStatusCode.NotFound).json({ message: "vaaliplatta_auth_token cookie missing" })

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as DecodedToken // TODO not quite a valid type assertation

        const userInfo = {
            pk: decoded.pk,
            email: decoded.email,
            first_name: decoded.first_name,
            last_name: decoded.last_name,
            is_superuser: decoded.is_superuser,
        }

        res.status(HttpStatusCode.Ok).json(userInfo)

    } catch (error) {
        console.error(error)
        res.status(HttpStatusCode.Unauthorized).json({ message: "Invalid or expired token" })
    }
})
