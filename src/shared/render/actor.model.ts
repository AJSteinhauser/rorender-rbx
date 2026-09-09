import { RenderConstants } from "shared/render/render.model"
import { Settings } from "shared/settings/settings.model"

export const COMPUTE_ROW_MESSAGE = "COMPUTE_ROW"
export const SET_HEIGHT_PREPASS_MESSAGE = "SET_HEIGHT_PREPASS"

export interface ActorMessage {
    settings: Settings
    row: number
    renderConstants: RenderConstants
    encodeOnRow: boolean
}
