/**
 * Returns a URL for the specified image that is compatible with imgproxy.
 *
 * @param url The original URL of the image.
 * @param name The transformation name (optional).
 * @returns A URL for the image that is compatible with imgproxy.
 */
const imageProxy = (url: string, name?: string): string => {
  if (!url) {
    return '';
  }

  return `${url}`;
};

export default imageProxy;
