export const IMAGE_ERASER_MODEL_INPUT_SIZE = 512
export const IMAGE_ERASER_MODEL_URL = "https://huggingface.co/Carve/LaMa-ONNX/resolve/main/lama_fp32.onnx"

export type ImageEraserBrushShape = "circle" | "square"
export type ImageEraserBrushMode = "paint" | "erase"
export type ImageEraserExecutionProvider = "webgpu" | "wasm"

export interface ImageEraserInpaintRequest {
    type: "inpaint"
    taskId: string
    imageData: ImageData
    maskData: ImageData
    modelUrl: string
}

export interface ImageEraserStatusMessage {
    type: "status"
    taskId: string
    phase: "loading-model" | "running"
    message: string
}

export interface ImageEraserResultMessage {
    type: "result"
    taskId: string
    imageData: ImageData
    executionProvider: ImageEraserExecutionProvider
}

export interface ImageEraserErrorMessage {
    type: "error"
    taskId: string
    error: string
}

export type ImageEraserWorkerResponse =
    | ImageEraserStatusMessage
    | ImageEraserResultMessage
    | ImageEraserErrorMessage
