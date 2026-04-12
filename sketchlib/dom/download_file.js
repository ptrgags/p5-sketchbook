/**
 * Download a generated file
 * @param {File} file The file to downlowd
 */
export function download_file(file) {
  const url = URL.createObjectURL(file);

  const anchor = document.createElement("a");
  anchor.setAttribute("href", url);
  anchor.setAttribute("download", file.name);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
