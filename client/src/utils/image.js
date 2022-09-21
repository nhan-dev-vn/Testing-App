
export function getImagesInHtmlTags(html) {
  if (!html) {
      return [];
  }
  const pattern = /<img\s+[^>]*?src=("|')([^"']+)\1/gi;
  const possibleImages = html.match(pattern);
  const images = [];
  possibleImages?.forEach((img) => {
      const srcIndex = img.indexOf('src="') + 5; // to remove 'src="';
      const srcStr = img.slice(srcIndex, img.length - 1);
      images.push(srcStr);
      console.log(img);
  });
  return images;
}

function getImageName(url) {
  const lastDotPos = url.lastIndexOf('.');
  return url.substring(url.lastIndexOf('/') + 1, lastDotPos > 0 ? lastDotPos : url.length);
}

// remove origin(window.location.origin) from url
function getRelativeImageUrl(origin, url) {
  return url.startsWith(origin) ? url.substring(origin.length) : url;
}

// origin = window.location.origin
export function getImagesProperty(selector, origin) {
  const images = (document.querySelector(selector))?.contentWindow?.document?.body?.querySelectorAll('img');
  if (!images) {
      return [];
  }
  const imageArray = [];
  images.forEach((image) => {
      const src = (image).src;
      const imgStyle = (image).style;
      const width = imgStyle.width;
      const height = imgStyle.height;
      if (src.indexOf('base64') === -1) {
          const img = {
              name: getImageName(src),
              value: getRelativeImageUrl(origin, src),
              size: {
                  w: width.slice(0, width.indexOf('px')),
                  h: height.slice(0, height.indexOf('px')),
              }
          };
          imageArray.push(img);
      }
  });
  return imageArray;
}