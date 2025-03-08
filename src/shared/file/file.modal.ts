export const RORENDER_FILE_VERSION = 1;
export const HEADER_DATA_SIZE = 6;
export const STRING_ENCODING_SEPERATOR = "@#%";

export interface ImageBuffers {
  red: buffer;
  green: buffer;
  blue: buffer;
  height: buffer;
  material: buffer;
  roads: buffer;
  buildings: buffer;
  water: buffer;
  materialsEncoding: buffer;
}

export const FILE_FORMAT_DATA_ORDER: (keyof ImageBuffers)[] = [
  "red",
  "green",
  "blue",
  "height",
  "material",
  "roads",
  "buildings",
  "water",
  "materialsEncoding",
];
