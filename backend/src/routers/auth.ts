import { Router } from 'express';
import { config } from '../config'
import { AuthorizationCode } from 'simple-oauth2';
import axios from 'axios';
import jwt from 'jsonwebtoken';

export const authRouter = Router();


const client = new AuthorizationCode({
    client: {
        id: config.OAUTH_CLIENT_ID,
        secret: config.OAUTH_CLIENT_SECRET,
    },
    auth: {
        tokenHost: config.OAUTH_TOKEN_HOST,
        tokenPath: config.OAUTH_TOKEN_PATH,
        authorizeHost: config.OAUTH_AUTHORIZE_HOST,
        authorizePath: config.OAUTH_AUTHORIZE_PATH,
    },
});


authRouter.get('/oauth2/login', (req, res) => {
    const authorizationUri = client.authorizeURL({
        redirect_uri: config.OAUTH_CALLBACK_URI,
        scope: 'read',
        state: Math.random().toString(36).substring(7) // CSRF protection
    });

    res.redirect(authorizationUri);
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
    const { code } = req.query;
    const options = {
        code: code?.toString()!,
        redirect_uri: config.OAUTH_CALLBACK_URI
    };

    try {
        const accessToken = await client.getToken(options);

        const user = await axios.get(config.OAUTH_PROFILE_URL, { headers: { Authorization: `Bearer ${accessToken.token.access_token}` } })
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