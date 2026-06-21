import { describe, it, expect } from "vitest"
import { buildWifiPayload, escapeWifiValue } from "./wifi-qr-generator.utils"

describe("escapeWifiValue", () => {
    it("escapes backslash, semicolon, comma, colon and double-quote", () => {
        expect(escapeWifiValue(`a\\b;c,d:e"f`)).toBe(`a\\\\b\\;c\\,d\\:e\\"f`)
    })

    it("leaves a plain value untouched", () => {
        expect(escapeWifiValue("MyHome")).toBe("MyHome")
    })
})

describe("buildWifiPayload", () => {
    it("builds a WPA payload", () => {
        expect(
            buildWifiPayload({ ssid: "MyHome", password: "secret123", encryption: "WPA", hidden: false }),
        ).toBe("WIFI:T:WPA;S:MyHome;P:secret123;;")
    })

    it("builds a WEP payload", () => {
        expect(
            buildWifiPayload({ ssid: "OldRouter", password: "abcde", encryption: "WEP", hidden: false }),
        ).toBe("WIFI:T:WEP;S:OldRouter;P:abcde;;")
    })

    it("builds an open (nopass) payload and omits the password", () => {
        expect(
            buildWifiPayload({ ssid: "FreeWifi", password: "ignored", encryption: "nopass", hidden: false }),
        ).toBe("WIFI:T:nopass;S:FreeWifi;;")
    })

    it("appends H:true for hidden networks", () => {
        expect(
            buildWifiPayload({ ssid: "Ghost", password: "pw", encryption: "WPA", hidden: true }),
        ).toBe("WIFI:T:WPA;S:Ghost;P:pw;H:true;;")
    })

    it("omits password but keeps hidden flag for open hidden networks", () => {
        expect(
            buildWifiPayload({ ssid: "Cafe", password: "", encryption: "nopass", hidden: true }),
        ).toBe("WIFI:T:nopass;S:Cafe;H:true;;")
    })

    it("escapes special characters in ssid and password", () => {
        expect(
            buildWifiPayload({ ssid: "My;Net", password: `p:a"ss`, encryption: "WPA", hidden: false }),
        ).toBe(`WIFI:T:WPA;S:My\\;Net;P:p\\:a\\"ss;;`)
    })
})
