export const host = 'https://e-commerce-vknr.onrender.com'

export const imageUrl = (image) => {
  const source = Array.isArray(image) ? image[0] : image

  if (!source || typeof source !== 'string') {
    return ''
  }

  return /^https?:\/\//i.test(source)
    ? source
    : `${host}/image/${encodeURIComponent(source)}`
}
// export const host=""