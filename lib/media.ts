const VIDEO_EXTENSION_PATTERN = /\.(mp4|mov|webm|m4v|ogg|ogv)$/i;

export function isVideoAsset(path: string | null | undefined) {
  if (!path) {
    return false;
  }

  const normalizedPath = path.split("?")[0] ?? path;
  return VIDEO_EXTENSION_PATTERN.test(normalizedPath);
}
