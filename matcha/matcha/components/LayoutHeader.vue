<template>
  <b-navbar toggleable="lg" type="dark" variant="primary">
    <!-- Brand -->
    <b-navbar-brand class="font-weight-bold" to="/">MATCHA</b-navbar-brand>

    <!-- Responsive -->
    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <!-- Content -->
    <b-collapse id="nav-collapse" is-nav>
      <!-- Left aligned nav items -->
      <b-navbar-nav>
        <b-nav-item
          class="mx-1 font-weight-bold"
          style="color: white !important"
          to="/match"
          >Match</b-nav-item
        >
        <b-nav-item
          class="mx-1 font-weight-bold"
          style="color: white !important"
          to="/chat"
          >Chat</b-nav-item
        >
        <b-nav-item v-b-modal.generate class="mx-1">Generate users</b-nav-item>
      </b-navbar-nav>

      <!-- Report modals -->
      <b-modal id="generate" title="Generate new users" @ok="build(500)">
        <p class="text-center my-4">
          <font-awesome-icon icon="robot" style="font-size: 2em" />
        </p>
        <p class="text-center my-4">Generate 500 bot users ?</p>
      </b-modal>

      <!-- Right aligned nav items -->
      <b-navbar-nav v-if="$auth.$state.loggedIn" class="ml-auto">
        <!-- Search bar -->
        <b-nav-item class="mr-2" to="/search">
          <font-awesome-icon color="white" icon="magnifying-glass" />
        </b-nav-item>

        <!-- Notification dropdown style="position: absolute; left: 0.25rem; top: 0" -->
        <b-nav-item-dropdown right class="mx-1">
          <template #button-content>
            <b-badge
              v-if="length"
              pill
              variant="danger"
              style="position: absolute; left: 0.25rem; top: 0"
            >
              {{ length }}
            </b-badge>
            <font-awesome-icon color="white" icon="bell" />
          </template>

          <b-dropdown-item
            v-for="x in notifications"
            :key="x.notification_id"
            @click="readNotification(x)"
          >
            <div class="p-0">
              <div
                class="rounded p-1 bg-light d-flex flex-column align-items-start"
              >
                <div class="mr-auto text-wrap order-1">
                  {{ x.user_name }}
                </div>
                <div
                  class="text-right text-muted ml-auto mb-auto order-0"
                  style="font-size: 10px"
                >
                  {{ dateFormat(x.created_on) }}
                </div>
                <div class="small order-2">
                  {{ x.message }}
                </div>
              </div>
            </div>
          </b-dropdown-item>

          <b-dropdown-text v-if="length === 0">
            no notification
          </b-dropdown-text>

          <div class="text-center">
            <b-button
              v-if="length !== 0"
              class="mt-2"
              variant="outline-primary"
              size="sm"
              @click="readNotifications"
            >
              All as read
            </b-button>
          </div>
        </b-nav-item-dropdown>

        <!-- Account button -->
        <b-nav-item-dropdown right class="mx-1">
          <template #button-content>
            <font-awesome-icon color="white" icon="user" />
          </template>

          <b-dropdown-item to="/user">Profile</b-dropdown-item>
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
const typesNotifications = Object.freeze({
  view: 'visited your profile.',
  like: 'liked your profile.',
  unlike: 'unliked your profile.',
  match: 'has matched with you.',
  message: 'sent you a message',
  invit: 'sent you a date',
  date: 'answered your invitation',
});
export default {
  data() {
    return {
      notifications: [],
      length: 0,
    };
  },
  mounted() {
    this.socket = this.$nuxtSocket({
      name: 'main',
      channel: '/',
      auth: {
        token: localStorage.getItem('auth._token.local'),
      },
      reconnection: false,
    });
    this.$store.socket = this.socket;
    this.getNotifications();
    this.socket.on('receiveNotification', data => {
      this.manageNotifications(data);
    });
  },

  methods: {
    async build(number) {
      await this.$axios.post('registerMany', number);
    },
    manageNotifications(data) {
      data.forEach(e => {
        this.manageNotification(e);
      });
      this.lengthNotifications();
    },

    manageNotification(notif) {
      if (notif) {
        const message = typesNotifications[notif.type];
        if (message) {
          notif.message = message;
          notif.link = '/user/' + notif.user_id_send;
          if (
            notif.type === 'message' ||
            notif.type === 'match' ||
            notif.type === 'invit' ||
            notif.type === 'date'
          )
            notif.link = '/chat';
          this.notifications.push(notif);
        }
      }
    },

    async readNotification(notification) {
      const id = notification.notification_id;
      try {
        await this.$axios.post('/read-notification', { id });
        this.notifications.splice(
          this.notifications.findIndex(e => e.notification_id === id),
          1
        );
        if (this.length) this.length -= 1;
        this.$router.push(notification.link);
      } catch (e) {}
    },

    async readNotifications() {
      try {
        await this.$axios.post('/read-notifications');
        this.notifications = [];
        this.length = 0;
      } catch (e) {}
    },

    async getNotifications() {
      try {
        const res = await this.$axios.get('/get-notifications');
        this.manageNotifications(res.data);
      } catch (e) {}
    },

    lengthNotifications() {
      this.length = this.notifications.length;
    },

    dateFormat(date) {
      const format = new Date(Date.parse(date));
      return format.toISOString().split('T')[0];
    },

    logout() {
      if (this.socket) this.socket.disconnect();
      this.$auth.logout();
      // Code will also be required to invalidate the JWT Cookie on external API
    },
  },
};
</script>

<style>
[role='menuitem'] {
  padding: 0.25rem !important;
}
</style>
