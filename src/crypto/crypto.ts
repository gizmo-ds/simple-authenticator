import { decode_base64, encode_base64 } from './utils'

export async function pbkdf2(
  key: BufferSource,
  salt: BufferSource,
  iterations: number
) {
  const _key = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  return await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    _key,
    256
  )
}

export class SymmetricCryptoKey {
  public key: Uint8Array
  public enc: Uint8Array
  public mac: Uint8Array
  constructor(buf: ArrayBuffer) {
    this.enc = new Uint8Array(buf, 0, buf.byteLength / 2)
    this.mac = new Uint8Array(buf, buf.byteLength / 2)
    this.key = new Uint8Array(buf)
  }
}

export async function stretch_key(key: BufferSource) {
  const enc = await hkdf_expand(key, new TextEncoder().encode('enc'), 32)
  const mac = await hkdf_expand(key, new TextEncoder().encode('mac'), 32)
  const new_key = new Uint8Array(64)
  new_key.set(enc)
  new_key.set(mac, 32)
  return new SymmetricCryptoKey(new_key.buffer)
}

export async function hkdf_expand(
  prk: BufferSource,
  info: Uint8Array,
  size: number
) {
  const alg = { name: 'HMAC', hash: { name: 'SHA-256' } }
  const key = await crypto.subtle.importKey('raw', prk, alg, false, ['sign'])
  const okm = new Uint8Array(size)
  let pt = new Uint8Array(0)
  const n = Math.ceil(size / 32)
  for (let i = 0; i < n; i++) {
    const t = new Uint8Array(pt.length + info.length + 1)
    t.set(pt)
    t.set(info, pt.length)
    t.set([i + 1], t.length - 1)
    pt = new Uint8Array(await crypto.subtle.sign(alg, key, t.buffer))
    okm.set(pt, i * 32)
  }
  return okm
}

export function gen_sym_key() {
  const key = new Uint8Array(64)
  crypto.getRandomValues(key)
  return new SymmetricCryptoKey(key.buffer)
}

export class RSAKeyPair {
  constructor(public public_key: Uint8Array, public private_key: Uint8Array) {}
}

export async function gen_rsa_keys() {
  const pair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: 'SHA-1' },
    },
    true,
    ['encrypt', 'decrypt']
  )
  const public_key = new Uint8Array(
    await crypto.subtle.exportKey('spki', pair.publicKey)
  )
  const private_key = new Uint8Array(
    await crypto.subtle.exportKey('pkcs8', pair.privateKey)
  )
  return new RSAKeyPair(public_key, private_key)
}

async function macs_equal(
  mac1: BufferSource,
  mac2: BufferSource,
  key: BufferSource
) {
  const alg = {
    name: 'HMAC',
    hash: { name: 'SHA-256' },
  }
  const _key = await crypto.subtle.importKey('raw', key, alg, false, ['sign'])
  const _mac1 = await crypto.subtle.sign(alg, _key, mac1)
  const _mac2 = await crypto.subtle.sign(alg, _key, mac2)
  if (_mac1.byteLength !== _mac2.byteLength) return false
  const mac1_arr = new Uint8Array(_mac1)
  const mac2_arr = new Uint8Array(_mac2)
  for (let i = 0; i < mac2_arr.length; i++)
    if (mac1_arr[i] !== mac2_arr[i]) return false
  return true
}

export class Cipher {
  public string: string
  constructor(
    public iv: Uint8Array,
    public encrypted: Uint8Array,
    public mac_data: Uint8Array
  ) {
    this.string =
      encode_base64(iv) +
      '|' +
      encode_base64(encrypted) +
      '|' +
      encode_base64(mac_data)
  }

  static from_string(str: string) {
    const [iv, encrypted, mac_data] = str.split('|').map(decode_base64)
    if (!iv || !encrypted || !mac_data) throw new Error('Invalid cipher')
    return new Cipher(iv, encrypted, mac_data)
  }
}

export async function aes_encrypt(
  data: BufferSource,
  enc: BufferSource,
  mac: BufferSource,
  iv?: Uint8Array
) {
  const enc_options = {
    name: 'AES-CBC',
    iv: new Uint8Array(16),
  }
  if (iv) enc_options.iv = iv
  else crypto.getRandomValues(enc_options.iv)

  const key = await crypto.subtle.importKey(
    'raw',
    enc,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  )
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(enc_options, key, data)
  )

  const t_data_mac = new Uint8Array(
    enc_options.iv.byteLength + encrypted.byteLength
  )
  t_data_mac.set(enc_options.iv, 0)
  t_data_mac.set(encrypted, enc_options.iv.byteLength)
  const mac_buf = await crypto.subtle.sign(
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    await crypto.subtle.importKey(
      'raw',
      mac,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    ),
    t_data_mac
  )
  const mac_data = new Uint8Array(mac_buf)
  return new Cipher(enc_options.iv, encrypted, mac_data)
}

export async function aes_decrypt(
  cipher: Cipher,
  enc: BufferSource,
  mac: BufferSource
) {
  const t_data_mac = new Uint8Array(
    cipher.iv.byteLength + cipher.encrypted.byteLength
  )
  t_data_mac.set(cipher.iv, 0)
  t_data_mac.set(cipher.encrypted, cipher.iv.byteLength)
  const mac_buf = await crypto.subtle.sign(
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    await crypto.subtle.importKey(
      'raw',
      mac,
      { name: 'HMAC', hash: { name: 'SHA-256' } },
      false,
      ['sign']
    ),
    t_data_mac
  )
  if (!(await macs_equal(cipher.mac_data, mac_buf, enc))) throw 'Invalid MAC'

  const key = await crypto.subtle.importKey(
    'raw',
    enc,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  )
  return await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: cipher.iv },
    key,
    cipher.encrypted
  )
}
