declare module 'hwp.js' {
    export class Viewer {
        constructor(element: HTMLElement, data: Uint8Array, options?: { type?: string });
    }
}
