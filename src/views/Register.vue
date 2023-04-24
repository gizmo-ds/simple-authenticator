<script lang="ts" setup>
import type { FormInst, FormItemRule, FormRules } from 'naive-ui'
import { useRouter } from 'vue-router'
import { useAccountStore } from '@/stores/account'

const account_store = useAccountStore()
const router = useRouter()

const form_ref = $ref<FormInst | null>(null)
const form_value = $ref({
  account: '',
  password: '',
  confirm_password: '',
})
const form_rules: FormRules = {
  account: {
    required: true,
    validator: (_rule: FormItemRule, value: string) => {
      if (!value) return new Error('Please input your email address')
      else if (!/\S+@\S+\.\S+/.test(value))
        return new Error('Invalid email address')
      return true
    },
    trigger: 'input',
  },
  password: {
    required: true,
    message: 'Please input your password',
    trigger: 'input',
  },
  confirm_password: {
    required: true,
    validator: (_rule: FormItemRule, value: string) => {
      if (!value) return new Error('Confirm password is required')
      else if (value !== form_value.password)
        return new Error('Password does not match')
      return true
    },
    trigger: 'input',
  },
}
let loading = $ref(false)
async function register(e: MouseEvent) {
  e.preventDefault()
  const errors = await form_ref?.validate().catch((e) => e as Error[])
  if (errors && errors.length > 0) return
  loading = true
  account_store
    .create_account(form_value.account, form_value.password)
    .then(() => {
      localStorage.setItem('account', form_value.account)
      router.push({ name: 'login' })
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
        />
      </n-form-item>
      <n-form-item label="Master password" path="password">
        <n-input
          type="password"
          show-password-on="click"
          placeholder=""
          v-model:value="form_value.password"
        />
      </n-form-item>
      <n-form-item label="Confirm master password" path="confirm_password">
        <n-input
          type="password"
          show-password-on="click"
          placeholder=""
          v-model:value="form_value.confirm_password"
        />
      </n-form-item>

      <div style="padding-top: 8px">
        <n-button
          type="primary"
          block
          secondary
          :loading="loading"
          @click="register"
        >
          Create account
        </n-button>
      </div>
    </n-form>

    <n-divider />
    <div style="text-align: center">
      Already have an account?
      <router-link :to="{ name: 'login' }"> Login </router-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  height: calc(100vh - 64px - (6px * 2));
  padding: 6px 16px;
}
a {
  color: #63e2b7;
  text-decoration: none;
}
</style>
