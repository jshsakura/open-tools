/// <reference lib="webworker" />

import type * as OrtType from "onnxruntime-web"
import {
    IMAGE_ERASER_MODEL_INPUT_SIZE,
    type ImageEraserExecutionProvider,
    type ImageEraserInpaintRequest,
    type ImageEraserWorkerResponse,
} from "./image-eraser.shared"

type OrtModule = typeof OrtType

let cachedOrt: OrtModule | null = null
let cachedSession: OrtType.InferenceSession | null = null
let cachedExecutionProvider: ImageEraserExecutionProvider | null = null
let cachedModelUrl: string | null = null

const workerScope = self as DedicatedWorkerGlobalScope

function postMessageToMainThread(message: ImageEraserWorkerResponse) {
    workerScope.postMessage(message)
}

async function loadOrtWithProvider(provider: ImageEraserExecutionProvider): Promise<OrtModule> {
    if (provider === "webgpu") {
        return import("onnxruntime-web/webgpu")
    }

    return import("onnxruntime-web/wasm")
}

async function getSession(taskId: string, modelUrl: string): Promise<{
    ort: OrtModule
    session: OrtType.InferenceSession
    executionProvider: ImageEraserExecutionProvider
}> {
    if (cachedOrt && cachedSession && cachedExecutionProvider && cachedModelUrl === modelUrl) {
        return {
            ort: cachedOrt,
            session: cachedSession,
            executionProvider: cachedExecutionProvider,
        }
    }

    postMessageToMainThread({
        type: "status",
        taskId,
        phase: "loading-model",
        message: "Preparing local inpainting model…",
    })

    const providers: ImageEraserExecutionProvider[] = ["webgpu", "wasm"]
    let lastError: Error | null = null

    for (const provider of providers) {
        try {
            const ort = await loadOrtWithProvider(provider)
            const session = await ort.InferenceSession.create(modelUrl, {
                executionProviders: [provider],
                graphOptimizationLevel: "all",
            })

            cachedOrt = ort
            cachedSession = session
            cachedExecutionProvider = provider
            cachedModelUrl = modelUrl

            return { ort, session, executionProvider: provider }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error("Failed to initialize inference runtime")
        }
    }

    throw lastError ?? new Error("Unable to initialize local inpainting runtime")
}

function imageDataToTensorData(imageData: ImageData) {
    const { data, width, height } = imageData
    const tensor = new Float32Array(3 * width * height)
    const planeSize = width * height

    for (let index = 0; index < planeSize; index += 1) {
        const pixelOffset = index * 4
        tensor[index] = data[pixelOffset] / 255
        tensor[planeSize + index] = data[pixelOffset + 1] / 255
        tensor[planeSize * 2 + index] = data[pixelOffset + 2] / 255
    }

    return tensor
}

function maskDataToTensorData(maskData: ImageData) {
    const { data, width, height } = maskData
    const tensor = new Float32Array(width * height)

    for (let index = 0; index < width * height; index += 1) {
        const pixelOffset = index * 4
        const alpha = data[pixelOffset + 3] / 255
        tensor[index] = alpha > 0.02 ? 1 : 0
    }

    return tensor
}

function tensorToImageData(tensor: OrtType.Tensor, width: number, height: number) {
    const rgba = new Uint8ClampedArray(width * height * 4)
    const values = tensor.data

    if (!(values instanceof Float32Array)) {
        throw new Error("Unexpected inpainting output tensor type")
    }

    const planeSize = width * height
    for (let index = 0; index < planeSize; index += 1) {
        rgba[index * 4] = Math.max(0, Math.min(255, Math.round(values[index] * 255)))
        rgba[index * 4 + 1] = Math.max(0, Math.min(255, Math.round(values[planeSize + index] * 255)))
        rgba[index * 4 + 2] = Math.max(0, Math.min(255, Math.round(values[planeSize * 2 + index] * 255)))
        rgba[index * 4 + 3] = 255
    }

    return new ImageData(rgba, width, height)
}

workerScope.onmessage = async (event: MessageEvent<ImageEraserInpaintRequest>) => {
    const message = event.data

    if (message.type !== "inpaint") {
        return
    }

    try {
        const { ort, session, executionProvider } = await getSession(message.taskId, message.modelUrl)

        postMessageToMainThread({
            type: "status",
            taskId: message.taskId,
            phase: "running",
            message: executionProvider === "webgpu" ? "Running local inpainting with WebGPU…" : "Running local inpainting with WASM…",
        })

        const height = message.imageData.height
        const width = message.imageData.width
        const imageTensor = new ort.Tensor("float32", imageDataToTensorData(message.imageData), [1, 3, height, width])
        const maskTensor = new ort.Tensor("float32", maskDataToTensorData(message.maskData), [1, 1, height, width])

        const imageInputName = session.inputNames[0]
        const maskInputName = session.inputNames[1]
        if (!imageInputName || !maskInputName) {
            throw new Error("Inpainting model inputs are unavailable")
        }

        const outputMap = await session.run({
            [imageInputName]: imageTensor,
            [maskInputName]: maskTensor,
        })

        const outputName = session.outputNames[0]
        if (!outputName) {
            throw new Error("Inpainting model output is unavailable")
        }

        const outputTensor = outputMap[outputName]
        if (!outputTensor) {
            throw new Error("Inpainting output tensor was empty")
        }

        postMessageToMainThread({
            type: "result",
            taskId: message.taskId,
            imageData: tensorToImageData(outputTensor, IMAGE_ERASER_MODEL_INPUT_SIZE, IMAGE_ERASER_MODEL_INPUT_SIZE),
            executionProvider,
        })
    } catch (error) {
        postMessageToMainThread({
            type: "error",
            taskId: message.taskId,
            error: error instanceof Error ? error.message : "Unknown inpainting error",
        })
    }
}

export {}
