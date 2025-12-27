import { get_sketch_url, get_thumbnail_url } from "./format_links.js";

/**
 * @typedef {Object} LinkInfo
 * @property {string} title Human-readable title of the sketch
 * @property {string} year Human-readable year to mark the sketch
 * @property {string} [link] URL to the sketch
 * @property {string} [thumbnail] URL to the thumbnail
 * @property {boolean} [is_lab=false] If true, the sketch is a lab sketch
 */

/**
 *
 * @param {string} sketch_url
 * @param {string} title
 * @param {string} thumbnail
 * @returns {HTMLAnchorElement}
 */
function make_thumbnail(sketch_url, title, thumbnail) {
  const thumbnail_url = thumbnail ?? get_thumbnail_url(title);

  // Clickable thumbnail
  const img = document.createElement("img");
  img.setAttribute("alt", `view ${title} example`);
  img.setAttribute("src", thumbnail_url);
  img.setAttribute("width", "250");
  img.setAttribute("height", "350");

  const img_link = document.createElement("a");
  img_link.setAttribute("href", sketch_url);
  img_link.appendChild(img);

  return img_link;
}

function make_test_tube(sketch_url) {
  const tube = document.createElement("span");
  tube.innerText = "🧪";
  tube.style.setProperty("font-size", "50px");

  return tube;
}

/**
 * Make a link to the sketch
 * @param {LinkInfo} link_info
 * @returns {HTMLDivElement}
 */
export function make_sketch_link(link_info) {
  const is_lab = link_info.is_lab ?? false;
  const title = is_lab ? `WIP: ${link_info.title}` : link_info.title;
  const sketch_url = link_info.link ?? get_sketch_url(title);

  // Make the title clickable too
  const text_link = document.createElement("a");
  text_link.setAttribute("href", sketch_url);
  text_link.innerText = title;

  const date = document.createTextNode(` (${link_info.year})`);

  const thumbnail = is_lab
    ? make_test_tube(sketch_url)
    : make_thumbnail(sketch_url, title, link_info.thumbnail);

  const link = document.createElement("div");
  link.classList.add("link");
  link.append(thumbnail, text_link, date);

  return link;
}
