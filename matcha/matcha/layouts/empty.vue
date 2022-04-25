<template>
  <div class="d-flex flex-column min-vh-100 overflow-hidden">
    <b-navbar toggleable="lg" type="dark" variant="primary">
      <!-- Brand -->
      <b-navbar-brand class="font-weight-bold" to="/">MATCHA</b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-nav-item class="mx-1" @click="logout">
          <font-awesome-icon color="white" icon="power-off" />
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <div class="py-5" style="flex: auto">
      <Nuxt />
    </div>

    <div class="position-relative">
      <div class="bg-primary text-white text-center text-lg-start mt-auto">
        <div class="container p-4">
          <p>Brought by</p>
          <div id="name-wrapper">
            <h5 class="text-uppercase p-2">MANDRIC</h5>
            <h5 class="text-uppercase p-2">RMAZARS</h5>
            <h5 class="text-uppercase p-2">TMARCON</h5>
            <h5 class="text-uppercase p-2">JOBENASS</h5>
          </div>
        </div>

        <div
          class="text-center p-3"
          style="background-color: rgba(0, 0, 0, 0.2)"
        >
          © 2022 Copyright:
          <a class="text-white" href="#">42 MATCHA</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    logout() {
      this.$auth.logout();
    },
  },
};
</script>
<style scoped>
#name-wrapper {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
}
</style>
