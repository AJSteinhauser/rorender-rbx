import { Settings, StructureGrouping } from "shared/settings/settings.model";
import { ActorHelperRequest, Pixel, RenderConstants } from "./render.model";
import { color3ToVector3 } from "shared/utils";
import { getEditableImage, getEditableMesh } from "./editable-cache";

const LIGHTING = game.GetService("Lighting");
const TERRAIN = game.Workspace.Terrain;

const DELAY_TIME = 3;

const SUN_POSITION = LIGHTING.GetSunDirection();

const rand = new Random();

const castParams = new RaycastParams();
castParams.FilterType = Enum.RaycastFilterType.Exclude;
castParams.FilterDescendantsInstances = [];

export function computePixel(
  position: Vector2,
  settings: Settings,
  renderConstants: RenderConstants,
  isParallel: boolean,
): Pixel | "texture" | undefined {
  const xOffset = position.X * settings.resolution;
  const zOffset = position.Y * settings.resolution;

  const rayCFrame = renderConstants.startingPosition.mul(
    new CFrame(xOffset, 0, zOffset),
  );
  const rayCenter = rayCFrame.Position;
  const results: RaycastResult[] = [];

  let waterHeight = 0; // Default to no water
  const rayBottom =
    renderConstants.startingPosition.Y - renderConstants.rayLength;

  // Helper function to compute height
  const calculateHeight = (y: number) =>
    math.floor(((y - rayBottom) / renderConstants.startingPosition.Y) * 255);

  // Initial raycast
  let primary = castRay(rayCenter, renderConstants.rayVector);
  if (!primary) return;
  if (isParallel) {
    if (primary.Instance.IsA("MeshPart") && !!primary.Instance.TextureID) {
      return "texture";
    }
  }

  // Handle water material
  if (checkIfRayIsWater(primary, settings)) {
    waterHeight = calculateHeight(primary.Position.Y);
    primary = castRay(rayCenter, renderConstants.rayVector, true);
    if (!primary) return;
  }

  results.push(primary);

  // Collect additional samples
  for (let i = 1; i < settings.samples; i++) {
    const samplePosition = getSamplePosition(
      rayCFrame,
      position,
      settings.resolution,
    );
    const result = castRay(samplePosition, renderConstants.rayVector, true);
    if (result) {
      results.push(result);
    }
  }

  if (isParallel) {
    if (
      results.some((x) => x.Instance.IsA("MeshPart") && !!x.Instance.TextureID)
    ) {
      return "texture";
    }
  }

  // Handle terrain hit
  const terrainHit =
    getTerrainHit(
      primary,
      rayCenter,
      renderConstants.rayVector,
      settings.terrain,
    ) || primary;

  // Compute color
  let color = averageColorSamples(results);
  color = averageShadeSamples(results, color, settings);
  color = gammaNormalizeSamples(color);
  if (settings.shadows.enabled) {
    color = applyShadowsSamples(results, color, settings);
  }

  // Determine groupings
  const buildingGrouping = findGrouping(settings.buildingGroups, primary, true);
  const roadGrouping = findGrouping(settings.roadGroups, primary, false);

  // Validate material map
  if (!renderConstants.materialMap.get(primary.Material)) {
    warn(
      renderConstants.materialMap,
      primary.Material,
      renderConstants.materialMap.get(primary.Material),
    );
  }

  return {
    r: math.floor(color.X * 255),
    g: math.floor(color.Y * 255),
    b: math.floor(color.Z * 255),
    h: calculateHeight(terrainHit.Position.Y),
    material: renderConstants.materialMap.get(primary.Material) || 0,
    road: roadGrouping,
    building: buildingGrouping,
    water: waterHeight,
  };
}

function checkIfRayIsWater(result: RaycastResult, settings: Settings): boolean {
  const group = settings.water;

  // Check instance hierarchy
  if (group.instances) {
    for (const item of group.instances) {
      if (result.Instance.IsDescendantOf(item)) return true;
    }
  }

  // Check materials
  if (group.materials) {
    const isMaterialMatch = group.materials.includes(result.Material);
    const isTerrainMatch = group.onlyTerrain
      ? result.Instance.ClassName === "Terrain"
      : true;

    if (isMaterialMatch && isTerrainMatch) {
      return true;
    }
  }
  return false;
}

// Helper function to find groupings (buildings, roads, etc.)
function findGrouping(
  groups: StructureGrouping[],
  primary: RaycastResult,
  allowNonTerrain: boolean,
): number {
  for (let i = 0; i < groups.size(); i++) {
    const group = groups[i];

    // Check instance hierarchy
    if (group.instances) {
      for (const item of group.instances) {
        if (primary.Instance.IsDescendantOf(item)) return i + 1;
      }
    }

    // Check materials
    if (group.materials) {
      const isMaterialMatch = group.materials.includes(primary.Material);
      const isTerrainMatch = group.onlyTerrain
        ? primary.Instance.ClassName === "Terrain"
        : true;

      if (isMaterialMatch && (allowNonTerrain || isTerrainMatch)) {
        return i + 1;
      }
    }
  }
  return 0;
}

function applyShadowsSamples(
  samples: RaycastResult[],
  color: Vector3,
  settings: Settings,
): Vector3 {
  const occludedSamples = samples.reduce(
    (acc, sample) => (checkSunShadow(sample, settings) ? acc + 1 : acc),
    0,
  );

  const shadowDarkness =
    (occludedSamples / samples.size()) * settings.shadows.darkness;
  return color.mul(1 - shadowDarkness);
}

function getSamplePosition(
  rayCenter: CFrame,
  position: Vector2,
  resolution: number,
): Vector3 {
  const randomOffset = new CFrame(
    (rand.NextNumber() - 0.5) * resolution,
    0,
    (rand.NextNumber() - 0.5) * resolution,
  );
  return randomOffset.mul(rayCenter).Position;
}

function castRay(
  rayPosition: Vector3,
  rayVector: Vector3,
  ignoreWater: boolean = false,
  rayParams: RaycastParams = castParams,
): RaycastResult | undefined {
  rayParams.IgnoreWater = ignoreWater;
  const results = game.Workspace.Raycast(rayPosition, rayVector, rayParams);
  if (!results) return results;
  if (results.Instance.Transparency < 1) return results;
  rayParams.AddToFilter(results.Instance);
  return castRay(rayPosition, rayVector, ignoreWater, rayParams);
}

function checkSunShadow(hit: RaycastResult, settings: Settings): boolean {
  let direction = settings.shadows.sunDirection; // Multiple samples at different positions act as shadow sample offsettings
  const occluded = castRay(hit.Position, direction.mul(3000));
  return !!occluded;
}

function getTerrainHit(
  RaycastResult: RaycastResult,
  rayPosition: Vector3,
  rayVector: Vector3,
  terrain: Instance[] = [game.Workspace.Terrain],
): RaycastResult | undefined {
  if (terrain.find((terrain: Instance) => RaycastResult.Instance === terrain)) {
    return RaycastResult;
  }
  const params = new RaycastParams();
  params.FilterType = Enum.RaycastFilterType.Include;
  params.AddToFilter(terrain);

  const result = castRay(rayPosition, rayVector, true, params);
  return result;
}

function getColorFromMesh(result: RaycastResult): Vector3 {
  if (!(result.Instance as MeshPart).TextureID) {
    return color3ToVector3(result.Instance.Color);
  }

  let editableMesh: EditableMesh | undefined = undefined;
  let editableImage: EditableImage | undefined = undefined;

  try {
    editableMesh = getEditableMesh((result.Instance as MeshPart).MeshId);
    editableImage = getEditableImage((result.Instance as MeshPart).TextureID);

    const mesh = editableMesh as EditableMesh;
    const image = editableImage as EditableImage;

    const scale = (result.Instance as MeshPart).MeshSize.div(
      result.Instance.Size,
    );
    const relativePoint = result.Instance.CFrame.PointToObjectSpace(
      result.Position,
    ).mul(scale);

    const [faceId, _surfacePoint, baryCoordinates] =
      mesh.FindClosestPointOnSurface(relativePoint);
    const uvs: number[] = mesh.GetFaceUVs(faceId) as number[];
    const uvCoordinates = uvs.map((x) => mesh.GetUV(x) as Vector2);

    const u =
      baryCoordinates.X * uvCoordinates[0]?.X +
      baryCoordinates.Y * uvCoordinates[1]?.X +
      baryCoordinates.Z * uvCoordinates[2]?.X;
    const v =
      baryCoordinates.X * uvCoordinates[0]?.Y +
      baryCoordinates.Y * uvCoordinates[1]?.Y +
      baryCoordinates.Z * uvCoordinates[2]?.Y;

    const samplePoint = new Vector2(
      math.floor(u * image.Size.X),
      math.floor(v * image.Size.Y),
    );
    const colorBuf = image.ReadPixelsBuffer(samplePoint, new Vector2(1, 1));

    const color = Color3.fromRGB(
      buffer.readu8(colorBuf, 0),
      buffer.readu8(colorBuf, 1),
      buffer.readu8(colorBuf, 2),
    );

    return color3ToVector3(color);
  } catch (e) {
    return color3ToVector3(result.Instance.Color);
  }
}

function getColorFromResult(result: RaycastResult): Vector3 {
  if (result.Instance !== game.Workspace.Terrain) {
    if (result.Instance.IsA("MeshPart")) {
      return getColorFromMesh(result);
    } else {
      return color3ToVector3(result.Instance.Color);
    }
  }
  if (result.Material === Enum.Material.Water) {
    return color3ToVector3(TERRAIN.WaterColor);
  }
  return color3ToVector3(TERRAIN.GetMaterialColor(result.Material));
}

function srgbToLinear(color: number): number {
  if (color <= 0.04045) {
    return color / 12.92;
  } else {
    return math.pow((color + 0.055) / 1.055, 2.4);
  }
}

function linearToSrgb(color: number): number {
  if (color <= 0.0031308) {
    return color * 12.92;
  } else {
    return 1.055 * math.pow(color, 1 / 2.4) - 0.055;
  }
}

function convertVector3SrgbToLinear(vector: Vector3): Vector3 {
  return new Vector3(
    srgbToLinear(vector.X),
    srgbToLinear(vector.Y),
    srgbToLinear(vector.Z),
  );
}

function convertVector3LinearToSrgb(vector: Vector3): Vector3 {
  return new Vector3(
    linearToSrgb(vector.X),
    linearToSrgb(vector.Y),
    linearToSrgb(vector.Z),
  );
}

function averageColorSamples(rayCastResults: RaycastResult[]): Vector3 {
  let color = new Vector3(0, 0, 0);

  for (const result of rayCastResults) {
    const sampleColor = getColorFromResult(result); // Await works here
    color = color.add(convertVector3SrgbToLinear(sampleColor));
  }
  return convertVector3LinearToSrgb(color.div(rayCastResults.size()));
}

function gammaNormalizeSamples(samples: Vector3): Vector3 {
  const gammeNormalize = 1.1;
  return new Vector3(
    samples.X ** gammeNormalize,
    samples.Y ** gammeNormalize,
    samples.Z ** gammeNormalize,
  );
}

function showDebugRayPosition(position: Vector3): Part {
  const part = new Instance("Part");
  part.Anchored = true;
  part.CFrame = new CFrame(position);
  part.Color = new Color3(1, 0, 0);
  part.Size = new Vector3(1, 1, 1);
  part.Parent = game.Workspace.Terrain;

  return part;
}

function averageShadeSamples(
  rayCastResults: RaycastResult[],
  inputColor: Vector3,
  settings: Settings,
): Vector3 {
  let color = new Vector3(0, 0, 0);
  rayCastResults.forEach((result: RaycastResult) => {
    color = color.add(
      convertVector3SrgbToLinear(shadeColor(inputColor, result, settings)),
    );
  });
  return convertVector3LinearToSrgb(color.div(rayCastResults.size()));
}

function shadeColor(
  color: Vector3,
  result: RaycastResult,
  settings: Settings,
): Vector3 {
  const recievedIlluminance = math.max(
    result.Normal.Dot(settings.shadows.sunDirection),
    0,
  );
  return color.mul(0.2 + recievedIlluminance * 0.8);
}

export function delayForScriptExhuastion(
  startTime: number,
  delayTime: number = DELAY_TIME,
): number {
  if (tick() - startTime > delayTime) {
    task.wait(0.1);
    return tick();
  } else {
    return startTime;
  }
}
