export const host = 'https://e-commerce-vknr.onrender.com'

export const imageUrl = (image) => {
  const value = Array.isArray(image) ? image[0] : image

  if (typeof value !== 'string' || !value.trim()) {
    return ''
  }

  const source = value.trim()

  if (/^(https?:|data:|blob:)/i.test(source)) {
    return source
  }

  if (source.startsWith('/')) {
    return source.startsWith('/image/')
      ? `${host}${source}`
      : source
  }

  return `${host}/image/${encodeURIComponent(source)}`
}
// export const host=""