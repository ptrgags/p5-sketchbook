export async function preload_p5_resources(p, manifest, resources) {
  const images = resources.images;
  const promises = Object.entries(manifest.images).map(async ([id, url]) => {
    images[id] = await p.loadImage(url);
  });

  await Promise.all(promises);
}
