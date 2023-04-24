<template>
  <header class="app-header">
    <h2>
      {{
        $route.meta.header_title
          ? $route.meta.header_title
          : 'Simple Authenticator'
      }}
    </h2>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  position: fixed;
  width: 100%;
  height: 64px;
  text-align: center;
  background-color: var(--n-color);
  z-index: 1;
  h2 {
    margin: 0;
    line-height: 64px;
  }
}
</style>
