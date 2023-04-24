export function encode_base64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf)
  let bs = ''
  for (let i = 0; i < bytes.byteLength; i++) bs += String.fromCharCode(bytes[i])
  return btoa(bs)
}

export function decode_base64(str: string) {
  const binary = atob(str)
  const length = binary.length
  const arr = new Uint8Array(length)
  for (let i = 0; i < length; i++) arr[i] = binary.charCodeAt(i)
  return arr
}
