<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { useAccountStore } from '@/stores/account'

const message = useMessage()
const router = useRouter()
const account_store = useAccountStore()

let account = localStorage.getItem('account')!
let password = $ref('')
let loading = $ref(false)

async function unlock() {
  loading = true
  account_store
    .unlock(account, password)
    .then(() => {
      router.push({ name: 'home' })
    })
    .catch((err) => message.error(err.message))
}
</script>

<template>
  <div class="container">
    <n-space vertical>
      <n-form-item label="Master password" :show-feedback="false">
        <n-input
          @keydown.enter="unlock"
          v-model:value="password"
          type="password"
          show-password-on="click"
          placeholder=""
          autofocus
        />
      </n-form-item>

      <n-button block secondary :loading="loading" @click="unlock">
        Unlock
      </n-button>
    </n-space>
  </div>
</template>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 64px - (6px * 2));
  padding: 6px 16px;
}
</style>
