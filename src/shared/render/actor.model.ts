import { RenderConstants } from "shared/render/render.model";
import { Settings } from "shared/settings/settings.model";

export const COMPUTE_ROW_MESSAGE = 'COMPUTE_ROW'

export interface ActorMessage {
    settings: Settings
    row: number
    renderConstants: RenderConstants
}
