// URL.createObjectURL
if (typeof window !== 'undefined') {
  window.URL = window.URL || window.webkitURL;
}

export default (code: string): Worker => {
  let blob;
  try {
    blob = new Blob([code], { type: 'application/javascript' });
  } catch (e: unknown) {
    // Backwards-compatibility
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    blob = new BlobBuilder();
    blob.append(code);
    blob = blob.getBlob();
  }
  return new Worker(URL.createObjectURL(blob));
};
