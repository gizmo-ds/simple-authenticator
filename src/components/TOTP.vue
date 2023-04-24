<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'
import { useBreakpoint } from 'vooks'

const props = defineProps<{
  secret: string
  period: number
  digits: number
}>()

const breakpoint = useBreakpoint()
const message = useMessage()

const timestamp = () => Math.round(new Date().getTime() / 1000)

let countdown = $ref(props.period)
setInterval(
  () => (countdown = props.period - (timestamp() % props.period)),
  1000
)

let code = $ref('123456')

const { copy, copied, isSupported } = useClipboard({ source: $$(code) })
watch(copied, (v) => v && message.success('Copied to clipboard'))
</script>

<template>
  <div class="totp-item">
    <div class="progress">
      <n-progress
        type="circle"
        :stroke-width="10"
        :status="countdown <= 8 ? 'error' : 'info'"
        :percentage="Math.round((countdown / period) * 100)"
      >
        <span class="countdown">
          {{ countdown }}
        </span>
      </n-progress>
    </div>

    <div
      class="info"
      :style="{
        cursor: isSupported ? 'pointer' : 'default',
      }"
      @click="isSupported && copy(code)"
    >
      <div class="account">Example (alice@example.com)</div>
      <div class="code">{{ code }}</div>
    </div>
  </div>

  <div class="divider-line">
    <div></div>
  </div>
</template>

<style lang="scss" scoped>
.totp-item {
  padding: 14px 16px;
  display: flex;
  .progress {
    display: flex;
    align-items: center;
    & :first-child {
      width: 60px;
    }

    .countdown {
      text-align: center;
      user-select: none;
    }
  }

  .info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-left: 18px;
    .account {
      font-size: 14px;
      color: var(--n-text-color);
    }
    .code {
      font-size: 24px;
      color: var(--n-text-color);
      font-weight: bold;
    }
  }
}
.divider-line {
  margin: 0 12px;
  div {
    height: 1px;
    border-bottom: 1px solid var(--n-border-color);
  }
  &:last-child {
    div {
      display: none;
    }
  }
}
</style>
