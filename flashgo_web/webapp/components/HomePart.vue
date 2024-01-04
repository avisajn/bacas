<template>
  <div>
    <div class="homepart">
      <p class="title">Top seller</p>
      <div class="content">
        <ul>
          <li>list</li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'HomePart',
    props: {
      endTime: String,
      styleType: String
    },
    data() {
      return {
       
      }
    },
    mounted() {

    },
    methods: {}
  }
</script>
<style scoped>
  .countdown-field-home {
    border-radius: .1rem;
    font-weight: bold;
    font-size: .6rem;
    color: red;
    background: #fff;
    padding-left: .2rem;
    padding-right: .2rem;
    margin-top: .1rem;
  }

  .countdown-sep-home {
    margin-left: .2rem;
    margin-right: .2rem;
    font-size: .6rem;
    color: #fff;
    font-weight: bold;
  }

  .countdown-block {
    padding-right: .5rem;
    padding-top: .3rem;
  }

  .countdown-field-detail {
    border-radius: .1rem;
    font-weight: bold;
    font-size: .6rem;
    color: rgba(242, 52, 78, 1);
    background: white;
    padding: .1rem .2rem;
    margin-top: .1rem;
  }

  .countdown-sep-detail {
    margin-left: .1rem;
    margin-right: .1rem;
    font-size: .7rem;
    font-weight: bold;
    color: white;
  }

</style>
