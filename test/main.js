/**
 * @author Venodez
 * @license ISC
 */

const { expect } = require("chai");
const {MinecraftProfile, Authentificator} = require("../lib/index");

describe("minecraft-auth", () => {
    const auth = new Authentificator("", "", "");
    const profil = auth.connectOffline("Venodez");
    it("should return a promise", () => {
        expect(profil).to.be.an.instanceOf(Promise);
        expect(profil).to.have.property("then");
    });
    it("shoud return '0e8667710dd63df5b3de6172ce2befe3'", async () => {
        let processedProfil = await profil;
        expect(processedProfil.uuid).to.equal("0e8667710dd63df5b3de6172ce2befe3");
    })
});