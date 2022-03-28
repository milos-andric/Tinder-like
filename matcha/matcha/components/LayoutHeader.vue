<template>
  <b-navbar toggleable="lg" type="dark" variant="primary">
    <!-- Brand -->
    <b-navbar-brand class="font-weight-bold" to="/">MATCHA</b-navbar-brand>

    <!-- Responsive -->
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <!-- Content -->
    <b-collapse id="nav-collapse" is-nav>
      <!-- Left aligned nav items -->
      <b-navbar-nav> </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav v-if="$auth.$state.loggedIn" class="ml-auto">
        <!-- Notification dropdown -->
        <b-nav-item-dropdown right class="mx-1">
          <template #button-content>
            <font-awesome-icon color="white" icon="bell" />
          </template>

          <b-dropdown-item v-if="notifications.length === 0" href="#">
            You have 0 notification.
          </b-dropdown-item>

          <b-dropdown-item
            v-for="x in notifications"
            :key="x.notification_id"
            href="#"
          >
            {{ x.content }}
          </b-dropdown-item>
        </b-nav-item-dropdown>

        <!-- Account button -->
        <b-nav-item-dropdown right class="mx-1">
          <template #button-content>
            <font-awesome-icon color="white" icon="user" />
          </template>

          <b-dropdown-item to="/profile">Profile</b-dropdown-item>
          <b-dropdown-item to="/me">About me</b-dropdown-item>
          <b-dropdown-item to="/security">Change password</b-dropdown-item>
        </b-nav-item-dropdown>

        <!-- Logout button -->
        <b-nav-item class="mx-1" @click="logout">
          <font-awesome-icon color="white" icon="power-off" />
        </b-nav-item>
      </b-navbar-nav>

      <b-navbar-nav v-else class="ml-auto">
        <b-nav-item class="mx-1" to="/login">
          <font-awesome-icon color="white" icon="user" />
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>
<script>
export default {
  data() {
    return {
      notifications: [],
    };
  },
  async beforeMount() {
    try {
      const res = await this.$axios.get('notifications');
      this.notifications = res.data;
      console.log(this.notifications);
    } catch (e) {
      console.log(e);
    }
  },
  methods: {
    logout() {
      this.$auth.logout();
      // Code will also be required to invalidate the JWT Cookie on external API
    },
  },
};
</script>
