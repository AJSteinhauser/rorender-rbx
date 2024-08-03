import { runLengthDecode, runLengthEncode } from 'shared/compression/run-length-encoding.compression'
import { FILE_FORMAT_DATA_ORDER } from 'shared/file/file.modal'
import { mergeImageBuffersIntoSingleBuffer } from 'shared/file/file.utils'
import { render } from 'shared/render/render.main'
import { renderSettings } from 'shared/settings/settings'

const output = render(renderSettings)

const merged = mergeImageBuffersIntoSingleBuffer(output)

const encoded = runLengthEncode(merged)
const decoded = runLengthDecode(encoded)

print(buffer.len(merged))
print(buffer.len(encoded))

print(string.format("%.2f%%", 1 - buffer.len(encoded) / buffer.len(merged)))


print( buffer.tostring(merged) === buffer.tostring(decoded))

