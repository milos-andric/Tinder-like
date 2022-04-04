/* eslint-disable vue/valid-v-for */
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
        <b-nav-item class="mx-1" to="/match">Match</b-nav-item>
        <b-nav-item class="mx-1" to="/generate">GeneratePerson</b-nav-item>
        <b-nav-item class="mx-1" to="/chat">Chat</b-nav-item>
      </b-navbar-nav>

      <!-- Right aligned nav items -->
      <b-navbar-nav v-if="$auth.$state.loggedIn" class="ml-auto">
        <!-- Search bar -->
        <b-nav-item class="mr-2" to="/search">
          <font-awesome-icon color="white" icon="magnifying-glass" />
        </b-nav-item>

        <!-- Notification dropdown -->
        <b-nav-item-dropdown right class="mx-1">
          <template #button-content>
            <font-awesome-icon color="white" icon="bell" />
          </template>

          <b-dropdown-item v-if="notifications.length === 0" href="#">
            You have 0 notification.
          </b-dropdown-item>

          <b-dropdown-item
            v-for="x in notifications.view"
            :key="x.notification_id"
            @click="readNotification(x)"
          >
            {{ x.message }}
          </b-dropdown-item>

          <button
            type="button"
            class="btn btn-primary"
            @click="readNotifications"
          >
            All as read
          </button>
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
  view: 'You have a visit',
  like: 'You have a like',
  unlike: 'You have a unlike',
  match: 'You have a match',
  message: 'You have a message',
});

export default {
  data() {
    return {
      notifications: { view: [], like: [], unlike: [], match: [], message: [] },
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
    this.socket.on('receiveNotification', data => {
      this.manageNotifications(data);
      // this.notifications = data;
    });
  },

  async beforeMount() {
    try {
      const res = await this.$axios.get('get-notifications');
      this.manageNotifications(res.data);
    } catch (e) {
      console.log(e);
    }
  },
  methods: {
    manageNotifications(data) {
      data.forEach(e => this.manageNotification(e));
    },

    manageNotification(notif) {
      console.log('FRONT:', notif.type);
      if (notif) {
        const message = typesNotifications[notif.type];
        if (message) {
          notif.message = message + ' by ' + notif.user_name;
          notif.link = '/user/' + notif.user_id_send;
          this.notifications[notif.type].push(notif);
        }
      }
    },

    async readNotification(notification) {
      const id = notification.notification_id;
      try {
        await this.$axios.post('read-notification', { id });
        this.notifications[notification.type].splice(
          this.notifications[notification.type].findIndex(
            obj => obj.notification_id === id
          ),
          1
        );
        this.$router.push(notification.link);
      } catch (e) {
        console.log(e);
      }
    },

    async readNotifications() {
      try {
        await this.$axios.post('read-notifications');
        this.notifications = [];
      } catch (e) {
        console.log(e);
      }
    },

    logout() {
      this.$auth.logout();
      // Code will also be required to invalidate the JWT Cookie on external API
    },
  },
};
</script>
