<template>
  <div class="col-10 m-auto">
    <div class="swiper">
      <div class="swiper-wrapper">
        <div
          v-for="user in users"
          :key="user.user_id"
          class="profile position-relative overflow-hidden mb-5 swiper-slide"
        >
          <div id="profile-image" class="position-absolute"></div>

          <div
            id="profile-info"
            class="
              position-absolute
              d-flex
              justify-content-between
              align-items-center
            "
          >
            <h2>
              {{ user.first_name + ', ' + user.age }}
            </h2>
            <b-link :to="'/user/' + user.user_id">
              <font-awesome-icon icon="circle-info" color="white" />
            </b-link>
          </div>

          <b-img
            :src="
              user.profile_pic ||
              'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Reuni%C3%A3o_com_o_ator_norte-americano_Keanu_Reeves_%2846806576944%29_%28cropped%29.jpg/260px-Reuni%C3%A3o_com_o_ator_norte-americano_Keanu_Reeves_%2846806576944%29_%28cropped%29.jpg'
            "
            fluid-grow
            alt="Responsive image"
          ></b-img>
        </div>
      </div>

      <div class="swiper-button-next"></div>
    </div>

    <div class="d-flex justify-content-around align-items-center">
      <font-awesome-icon
        id="icon-match-dislike"
        icon="xmark"
        @click="dislike()"
      />
      <font-awesome-icon id="icon-match-like" icon="fire" @click="like()" />
    </div>
  </div>
</template>

<script>
import { Swiper, Navigation, EffectCards } from 'swiper';
import 'swiper/swiper-bundle.min.css';

export default {
  data() {
    return {
      users: [],
      selected: 0,

      swiper: null,
    };
  },
  mounted() {
    Swiper.use([Navigation, EffectCards]);

    this.swiper = new Swiper('.swiper', {
      effect: 'cards',

      lazy: true,
      grabCursor: true,
      direction: 'horizontal',
      allowSlidePrev: false,

      navigation: {
        nextEl: '.swiper-button-next',
      },
    });

    this.swiper.on('slideChange', async e => {
      await this.$axios.post('view', {
        data: {
          targetId: this.users[this.selected].user_id,
        },
      });
      console.log(e.activeIndex);
      if (e.activeIndex + 1 === this.users.length) {
        try {
          const res = await this.$axios
          .post('getRecommandation', {
            offset: this.users.length,
          })
          this.users = [...this.users, ...res.data];
          this.swiper.init();
        } catch (e) {
          this.swiper.init();
        }
      }
      this.selected = e.activeIndex;
    });
  },
  async beforeMount() {
    await this.$axios
      .post('getRecommandation', {
        offset: this.users.length,
      })
      .then(r => {
        this.users = r.data;
      });
  },
  methods: {
    async like() {
      await this.$axios.post('like', {
        data: {
          targetId: this.users[this.selected].user_id,
        },
      });
      this.swiper.slideNext();
    },
    dislike() {
      this.swiper.init();
      this.swiper.slideNext();
    },
  },
};
</script>

<style>
.profile {
  border-radius: 20px;
}
#profile-info {
  width: 100%;
  font-size: 5vw;
  bottom: 0;
  color: white;
  padding: 4%;
}
#profile-image {
  box-shadow: inset 0px 0px 50px 25px rgba(0, 0, 0, 0.9);
  height: 100%;
  width: 120%;
  margin-left: -10%;
  margin-right: -10%;
}
#icon-match-like {
  width: 10%;
  height: 100%;
  color: greenyellow;
}
#icon-match-dislike {
  width: 10%;
  height: 100%;
  color: rgb(255, 85, 47);
}
</style>
