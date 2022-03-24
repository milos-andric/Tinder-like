<template>
  <div class="mx-auto col-6"></div>
</template>

<script>
export default {
  name: 'ActivatePage',
  auth: 'guest',
  async beforeMount() {
    if (this.$route.query.user_id && this.$route.query.code)
      await this.$axios
        .post('activate', {
          user_id: this.$route.query.user_id,
          code: this.$route.query.code,
        })
        .then(() => {
          this.$router.push({ path: '/login', query: { activate: true } });
        })
        .catch(() => {
          this.$router.push('/login');
        });
    else this.$router.push('/login');
  },
};
</script>
