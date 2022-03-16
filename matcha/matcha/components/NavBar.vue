<template>
  <b-navbar toggleable="lg" type="dark" variant="primary">
    <!-- Brand -->
    <b-navbar-brand class="text-bold" href="#">MATCHA</b-navbar-brand>

    <!-- Responsive -->
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <!-- Left aligned nav items -->
      <b-navbar-nav> </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template #button-content>
            <font-awesome-icon color="white" icon="bell" />
          </template>
          <b-dropdown-item href="#">Incredible notification</b-dropdown-item>
          <b-dropdown-item href="#"
            >Robin sent you a death threat</b-dropdown-item
          >
          <b-dropdown-item href="#">You are cringe</b-dropdown-item>
        </b-nav-item-dropdown>

        <b-nav-item @click="logout"
          ><font-awesome-icon color="white" icon="power-off"
        /></b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>
<script>
export default {
  methods: {
    logout() {
      this.$auth.logout();
      // Code will also be required to invalidate the JWT Cookie on external API
    },
  },
};
</script>
