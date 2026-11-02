const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word characters with a single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

module.exports = slugify;
