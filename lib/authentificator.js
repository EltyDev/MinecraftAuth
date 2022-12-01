/**
 * @author Venodez
 * @license ISC
 */

 const MinecraftProfile = require("./lib/minecraftProfile");

/*
 const clientID = "81a3e16d-0aba-4d30-ba3a-402394bf3f24";
 const clientSecret = "CbN8Q~u_3A5SlRuJCeZO2_OrvXfPc.LLIlDbralc";
 const redirectUri = "http://localhost/auth-response";
*/

const xboxAuthLink = "https://user.auth.xboxlive.com/user/authenticate";
const XSTSTokenLink = "https://xsts.auth.xboxlive.com/xsts/authorize";
const minecraftAuthLink = "https://api.minecraftservices.com/authentication/login_with_xbox";
const minecraftStoreLink = "https://api.minecraftservices.com/entitlements/mcstore";
 
/** Class representing the Authentificator */
class Authentificator {

    #clientID
    #clientSecret
    #redirectUri

    /** Create Authentificator from scratch */
    constructor() {}

    /**
     * Create Authentificator from Azure app
     * @param {string} clientID Azure app client id
     * @param {string} clientSecret Azure app client secret
     * @param {string} redirectUri Azure app redirect url
     */
    constructor(clientID, clientSecret, redirectUri) {
        this.#clientID = clientID;
        this.#clientSecret = clientSecret;
        this.#redirectUri = redirectUri;
    }
    
    /**
     * Check if this account has Minecraft
     * @param {string} minecraftAccessToken Minecraft access token 
     * @returns {Promise<boolean>} Return true or false if this account has Minecraft
     */
    async #hasMinecraft(minecraftAccessToken) {
     let response = await fetch(minecraftStoreLink, {
         headers: {
             "Authorization": "Bearer " + minecraftAccessToken
         }
     });
     let json = await response.json();
     return json.items.length > 0;
 }


    /**
     * Get Minecraft access token
     * @param {string} userHash Xbox user hash 
     * @param {string} XSTSToken Minecraft XSTS token
     * @returns {Promise<string>} Return Minecraft access token
     */
    async #getMinecraftAccessToken(userHash, XSTSToken) {
        let response = await fetch(minecraftAuthLink, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                "identityToken": "XBL3.0 x=" + userHash + ";" + XSTSToken
            })
        });

        let json = await response.json();
        return json.access_token;
    }

    /**
     * Get Minecraft XSTSToken
     * @param {string} xboxLiveToken Xbox Live Token 
     * @returns {Promise<string>} Return Minecraft XSTSToken
     */
    async #getMinecraftXSTSToken(xboxLiveToken) {    
        let response = await fetch(XSTSTokenLink, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                "Properties": {
                    "SandboxId": "RETAIL",
                    "UserTokens": [
                        xboxLiveToken
                    ]
                },
                "RelyingParty": "rp://api.minecraftservices.com/",
                "TokenType": "JWT"
            })
        });

        let json = await response.json();
        return json.Token;
    }


    /**
     * Get Xbox Live informations
     * @param {string} microsoftAccessToken Microsoft access token
     * @returns {Promise<Array<string>>} Return user's hash and Xbox Live token
     */
    async #getXboxLiveInformations(microsoftAccessToken) {
        let response = await fetch(xboxAuthLink, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                "Properties": {
                    "AuthMethod": "RPS",
                    "SiteName": "user.auth.xboxlive.com",
                    "RpsTicket": "d=" + microsoftAccessToken
                },
                "RelyingParty": "http://auth.xboxlive.com",
                "TokenType": "JWT"
            })
        });

        let json = await response.json();
        return [json.Token, json.DisplayClaims.xui[0].uhs];
    }

    /**
     * Get Microsoft access token
     * @param {string} oAuth2Code Microsoft OAuth2 authorization code flow
     * @returns {Promise<string>} Return Microsoft access token
     */
    async #getMicrosoftAccessToken(oAuth2Code) {    
        let response = await fetch("https://login.microsoftonline.com/consumers/oauth2/v2.0/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                "client_id": clientID,
                "scope": "XboxLive.signin",
                "code": microsoftCode,
                "redirect_uri": redirectUri,
                "grant_type": "authorization_code",
                "client_secret": clientSecret
            })
        });
    
        let json = await response.json();
        return json.access_token;
    }

    /**
     * Connect current user (offline mode)
     * @param username Username
     * @return void
     */
    connectOffline(username) { return new MinecraftProfile(username, offline=true); }

    /**
     * Connect current user
     * @param {string} oAuth2Code Microsoft OAuth2 authorization code flow
     * @return {Promise<MinecraftProfile>} Return his Minecraft profil if his account has Minecraft
     */
    async connect(oAuth2Code) {
        let microsoftAccessToken = await this.#getMicrosoftAccessToken(oAuth2Code);
        let [xboxLiveToken, userHash] = await this.#getXboxLiveInformations(microsoftAccessToken);
        let XSTSToken = await this.#getMinecraftXSTSToken(xboxLiveToken);
        let minecraftAccessToken = await this.#getMinecraftAccessToken(userHash, XSTSToken);
        if (await this.#hasMinecraft(minecraftAccessToken)) return undefined;
        return new MinecraftProfile(minecraftAccessToken);
    }

}
