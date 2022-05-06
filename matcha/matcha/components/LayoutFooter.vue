<template>
  <div class="position-relative">
    <MiniChat v-if="!$route.path.startsWith('/chat')" />

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

      <div id="copyrights" class="text-center p-3" style="background-color: rgba(0, 0, 0, 0.2)">
        © 2022 Copyright:
        <a class="text-white" href="#">42 MATCHA</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
#name-wrapper {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
}

@media only screen and (max-width: 500px) {
  #name-wrapper, #copyrights {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
}
</style>
