<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'
import { useBreakpoint } from 'vooks'
import { countdown as _countdown, timestamp } from '@/utils/time'
import { totp } from '@/totp'

const props = defineProps<{
  initialized?: boolean
  secret: string
  period: number
  digits: number
}>()

const breakpoint = useBreakpoint()
const message = useMessage()

let countdown = $ref(_countdown(props.period))
setTimeout(() => {
  update_code()
  setInterval(update_code, props.period * 1000)
}, countdown * 1000)
setInterval(() => (countdown = _countdown(props.period)), 1000)

let code = $ref('000000')
watch(props, (v) => {
  if (v.initialized) update_code()
})

function update_code() {
  code = totp(props.secret, timestamp(), props.digits, props.period)
}

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
      <div class="code">
        {{
          code.length === 6
            ? code
                .split('')
                .map((c, i) => (i > 0 && i % 3 === 0 ? ' ' + c : c))
                .join('')
            : code
        }}
      </div>
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
