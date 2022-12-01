/**
 * @author Venodez
 * @license ISC
 */

const crypto = require("crypto");

const minecraftProfileLink = "";

/** Class representing Minecraft profile */
class MinecraftProfile {

    /**
     * Create Minecraft profile from access token or username
     * @param {string} data Access token or username
     * @returns {Promise<}
     */
    constructor(data, offline=false) {
        return Promise(async (resolve) => {
            if (!offline) {
                let profil = await this.#getProfile(data);
                this.accessToken = data;
                this.username = profil.name;
                this.uuid = profil.id;
                this.skins = profil.skins;
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
        const hex = md5Bytes.toString('hex')
        const uuid = hex.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, "$1-$2-$3-$4-$5");
        return uuid;
    }

}

module.exports = MinecraftProfile;
