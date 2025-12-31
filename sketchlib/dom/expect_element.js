/**
 * Expect A DOM element to exist on the page with a particular type
 *
 * @template T
 * @param {string} id ID of the element on the page
 * @param {{new(): T}} expected_type class constructor for the element
 * @returns {T}
 */
export function expect_element(id, expected_type) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`element #${id} not found on page!`);
  }

  if (!(element instanceof expected_type)) {
    throw new Error(`expected #${id} to be ${expected_type}, got ${element}`);
  }

  return element;
}
