import { init as init_wasm } from 'totp-wasm/packages/totp-wasm'
import wasm_url from 'totp-wasm/packages/totp-wasm/dist/totp_wasm_bg.wasm?url'
export { hotp, totp, steam } from 'totp-wasm/packages/totp-wasm'

export async function init_totp() {
  await init_wasm(wasm_url)
}
