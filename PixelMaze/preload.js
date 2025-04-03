function preload_images(p, manifest, resources) {
  for (const [id, url] of Object.entries(manifest)) {
    resources[id] = p.loadImage(url);
  }
}

export function preload_p5_resources(p, manifest, resources) {
  preload_images(p, manifest.images, resources.images);

  // Eventually sound goes here
}
