<script lang="ts" setup>
import { aes_encrypt, aes_decrypt, Cipher } from '@/crypto'
import { encode_base64 } from '@/crypto/utils'
import { useAccountStore } from '@/stores/account'

const message = useMessage()
const account_store = useAccountStore()

let secret_text = $ref('Hello world')

async function encrypt() {
  if (!account_store.sym_key) return message.error('No symmetric key found')
  aes_encrypt(
    new TextEncoder().encode(secret_text),
    account_store.sym_key.enc,
    account_store.sym_key.mac
  )
    .then((cipher) => {
      secret_text = cipher.string
    })
    .catch((e) => {
      message.error(e.message)
    })
}

async function decrypt() {
  if (!account_store.sym_key) return message.error('No symmetric key found')
  try {
    const plain_text = await aes_decrypt(
      Cipher.from_string(secret_text),
      account_store.sym_key.enc,
      account_store.sym_key.mac
    )
    secret_text = new TextDecoder().decode(plain_text)
  } catch (e: any) {
    message.error(e.message)
  }
}
</script>

<template>
  <div class="container">
    <n-p>
      Symmetric Key:
      {{
        account_store.sym_key
          ? encode_base64(account_store.sym_key.key)
          : 'null'
      }}
    </n-p>

    <n-space vertical>
      <n-input v-model:value="secret_text" type="textarea" />
      <n-space>
        <n-button @click="encrypt">Encrypt</n-button>
        <n-button @click="decrypt">Decrypt</n-button>
      </n-space>
    </n-space>
  </div>
</template>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 64px - (6px * 2));
  padding: 6px 16px;
}
</style>
