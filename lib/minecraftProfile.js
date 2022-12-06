/**
 * @author Venodez
 * @license ISC
 */

const crypto = require("crypto");
const fetch = require("node-fetch");

const minecraftProfileLink = "https://api.minecraftservices.com/minecraft/profile";

/** Class representing Minecraft profile */
class MinecraftProfile {

    /**
     * Create Minecraft profile from access token or username
     * @param {string} data Access token or username
     * @returns {Promise<MinecraftProfile>}
     */
    constructor(data, offline=false) {
        return new Promise(async (resolve) => {
            if (!offline) {
                /* istanbul ignore next */
                let profil = await this.#getProfile(data);
                /**
                 * @property {string} accessToken Minecraft access token
                 */
                this.accessToken = data;
                /**
                 * @property {string} username Minecraft username
                 */
                this.username = profil.name;
                /**
                 * @property {string} uuid Minecraft universal unique identifier
                 */
                this.uuid = profil.id;
                /**
                 * @property {Array<JSON>} skins Array of JSON object of skins
                 */
                this.skins = profil.skins;
                /**
                 * @property {Array<JSON>} capes Array of JSON object of capeso
                 */
                this.capes = profil.capes;
            } else {
                this.accessToken = "";
                this.username = data;
                this.uuid = this.#generateOfflineUUID(this.username);
                this.skins = [];
                this.capes = [];
            }
            resolve(this);
        })
    }

    /**
     * Get Minecraft profile
     * @param {string} accessToken Minecraft access token
     * @returns {Promise<JSON>} Minecraft profile
     */
    async #getProfile(accessToken) {
        /* istanbul ignore next */
        let response = await fetch(minecraftProfileLink, {
            headers: {
                "Authorization": "Bearer " + accessToken
            }
        });
        return await response.json();
    }

    /**
     * Generate UUID from username. see: https://wiki.vg/Protocol#Spawn_Player 
     * @param {string} username username
     * @returns {string} Offline UUID
     */
    #generateOfflineUUID(username) {
        let md5Bytes = crypto.createHash('md5').update(`OfflinePlayer:${username}`).digest();
        md5Bytes[6]  &= 0x0f;
        md5Bytes[6]  |= 0x30;
        md5Bytes[8]  &= 0x3f;
        md5Bytes[8]  |= 0x80;
        return md5Bytes.toString('hex');
    }

}

module.exports = MinecraftProfile;
