import { runLengthDecode, runLengthEncode } from 'shared/compression/run-length-encoding.compression'
import { FILE_FORMAT_DATA_ORDER } from 'shared/file/file.modal'
import { mergeImageBuffersIntoSingleBuffer } from 'shared/file/file.utils'
import { render } from 'shared/render/render.main'
import { renderSettings } from 'shared/settings/settings'
import { getImageDimensions, HTTPS_BODY_LIMIT } from 'shared/utils'

task.wait(2)
const output = render(renderSettings)

const merged = mergeImageBuffersIntoSingleBuffer(output)

const encoded = runLengthEncode(merged)
const decoded = runLengthDecode(encoded)

print(getImageDimensions(renderSettings))
print('\n\n')
print(string.format("RAW: %.2f KB", buffer.len(merged) / 1000))
print(string.format("RAW Packets Required: %d", math.ceil(buffer.len(merged) / HTTPS_BODY_LIMIT)))
print("\n\n")

print(string.format("RLE compression: %.2f%%", (1 - (buffer.len(encoded) / buffer.len(merged))) * 100))
print(string.format("RLE: %2.f KB", buffer.len(encoded) / 1000))
print(string.format("RLE Packets Required: %d", math.ceil(buffer.len(encoded) / HTTPS_BODY_LIMIT)))
