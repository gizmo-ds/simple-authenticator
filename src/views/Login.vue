<script lang="ts" setup>
import type { FormInst, FormItemRule, FormRules } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { useAccountStore } from '@/stores/account'

const message = useMessage()
const router = useRouter()
const account_store = useAccountStore()
const account = useStorage('account', '')
let account_autofocus = $computed(() => account.value === '')
const form_ref = $ref<FormInst | null>(null)
const form_value = $ref({ account: account.value, password: '' })
const form_rules: FormRules = {
  account: {
    required: true,
    validator: (_rule: FormItemRule, value: string) => {
      if (!value) return new Error('Email address is required')
      else if (!/\S+@\S+\.\S+/.test(value))
        return new Error('Invalid email address')
      return true
    },
    trigger: 'input',
  },
  password: {
    required: true,
    message: 'Password is required',
    trigger: 'input',
  },
}
async function login(e: MouseEvent) {
  e.preventDefault()
  const errors = await form_ref?.validate().catch((e) => e as Error[])
  if (errors && errors.length > 0) return
  account_store
    .unlock(form_value.account, form_value.password)
    .then(() => {
      localStorage.setItem('account', form_value.account)
      router.push({ name: 'home' })
    })
    .catch((e) => {
      message.error(e.message)
    })
}
</script>

<template>
  <div class="container">
    <n-form ref="form_ref" :model="form_value" :rules="form_rules">
      <n-form-item label="Email address" path="account">
        <n-input
          type="text"
          show-password-on="click"
          placeholder=""
          v-model:value="form_value.account"
          :autofocus="account_autofocus"
        />
      </n-form-item>
      <n-form-item label="Master password" path="password">
        <n-input
          type="password"
          show-password-on="click"
          placeholder=""
          v-model:value="form_value.password"
          :autofocus="!account_autofocus"
          @keydown.enter="login"
        />
      </n-form-item>

      <div style="padding-top: 8px">
        <n-button type="primary" block secondary @click="login">
          Login
        </n-button>
      </div>
    </n-form>

    <n-divider />
    <div style="text-align: center">
      Don't have an account?
      <router-link :to="{ name: 'register' }">Create account</router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 64px - (6px * 2));
  padding: 6px 16px;
  padding-top: 64px + 6px;
}
a {
  color: #63e2b7;
  text-decoration: none;
}
</style>
