export function timestamp() {
  return Math.round(new Date().getTime() / 1000)
}

export function countdown(period: number) {
  return period - (timestamp() % period)
}
