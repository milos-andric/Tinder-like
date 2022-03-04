<!-- Please remove this file from your project -->
<template>
  <form method="post" @submit.prevent="login">
    <div class="field">
      <label class="label">Email</label>

      <div class="control">
        <input type="email" class="input" name="email" v-model="email" />
      </div>
    </div>

    <div class="field">
      <label class="label">Password</label>

      <div class="control">
        <input
          type="password"
          class="input"
          name="password"
          v-model="password"
        />
      </div>
    </div>

    <div class="control">
      <button type="submit" class="button is-dark is-fullwidth">Log In</button>
    </div>
  </form>
</template>

<script>
export default {
  name: "Login",
};
</script>
