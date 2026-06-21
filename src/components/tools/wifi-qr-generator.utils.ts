export type WifiEncryption = "WPA" | "WEP" | "nopass"

export interface WifiPayloadInput {
    ssid: string
    password: string
    encryption: WifiEncryption
    hidden: boolean
}

/**
 * Escapes special characters in a WiFi QR field value per the WIFI: URI spec.
 * The characters \ ; , : and " must be backslash-escaped.
 */
export function escapeWifiValue(value: string): string {
    return value.replace(/([\\;,:"])/g, "\\$1")
}

/**
 * Builds a standard WiFi QR payload string.
 * Format: WIFI:T:<type>;S:<ssid>;P:<password>;H:true;;
 * - Password (P) is omitted for open networks (encryption "nopass").
 * - H:true is only appended when the network is hidden.
 */
export function buildWifiPayload({ ssid, password, encryption, hidden }: WifiPayloadInput): string {
    const type = encryption === "nopass" ? "nopass" : encryption
    const parts = [`T:${type}`, `S:${escapeWifiValue(ssid)}`]

    if (encryption !== "nopass") {
        parts.push(`P:${escapeWifiValue(password)}`)
    }

    if (hidden) {
        parts.push("H:true")
    }

    return `WIFI:${parts.join(";")};;`
}
