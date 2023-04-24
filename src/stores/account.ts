import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  aes_decrypt,
  aes_encrypt,
  Cipher,
  gen_sym_key,
  pbkdf2,
  stretch_key,
  SymmetricCryptoKey,
} from '@/crypto'
import { encode_base64 } from '@/crypto/utils'

export const useAccountStore = defineStore('account', () => {
  const account = ref('')
  const sym_key = ref(undefined as SymmetricCryptoKey | undefined)

  async function create_account(account: string, password: string) {
    let pwd: Uint8Array | null = new TextEncoder().encode(password)
    let master_key: ArrayBuffer | null = await pbkdf2(
      pwd,
      new TextEncoder().encode(account),
      500_000
    )
    const master_key_hash = await pbkdf2(master_key, pwd, 1)
    // remove pwd from memory
    pwd = null

    let stretched_master_key: SymmetricCryptoKey | null = await stretch_key(
      master_key
    )
    // remove master_key from memory
    master_key = null

    let _sym_key: SymmetricCryptoKey | null = gen_sym_key()
    const protected_sym_key = await aes_encrypt(
      _sym_key.key,
      stretched_master_key.enc,
      stretched_master_key.mac
    )
    // remove sym_key from memory
    _sym_key = null
    // remove stretched_master_key from memory
    stretched_master_key = null

    localStorage.setItem('account', account)
    localStorage.setItem('master_key_hash', encode_base64(master_key_hash))
    localStorage.setItem('sym_key', protected_sym_key.string)
  }

  async function unlock(_account: string, password: string) {
    const store_master_key_hash = localStorage.getItem('master_key_hash')
    if (!store_master_key_hash) throw new Error('No master key hash found')

    const store_sym_key = localStorage.getItem('sym_key')
    if (!store_sym_key) throw new Error('No stretch key found')

    let pwd: Uint8Array | null = new TextEncoder().encode(password)
    let master_key: ArrayBuffer | null = await pbkdf2(
      pwd,
      new TextEncoder().encode(_account),
      500_000
    )
    const master_key_hash = await pbkdf2(master_key, pwd, 1)
    // remove pwd from memory
    pwd = null

    if (encode_base64(master_key_hash) !== store_master_key_hash)
      throw new Error('Wrong password')

    let stretched_master_key: SymmetricCryptoKey | null = await stretch_key(
      master_key
    )
    // remove master_key from memory
    master_key = null

    const sym_key_buf = await aes_decrypt(
      Cipher.from_string(store_sym_key),
      stretched_master_key.enc,
      stretched_master_key.mac
    )
    // remove stretched_master_key from memory
    stretched_master_key = null

    account.value = _account
    sym_key.value = new SymmetricCryptoKey(sym_key_buf)
  }

  return { account, sym_key, create_account, unlock }
})
