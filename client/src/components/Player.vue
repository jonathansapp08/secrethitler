<template>
<div class="columns">

<div v-for="index in 10" :key="index" class="column">
<div class="card" style="text-align: center;">
  <div class="card-content">
    <div class="media">
      <div class="media-content">
        <p class="title is-4">John Smith</p>
      </div>
    </div>
  </div>
  <div class="card-image">
    <figure class="image is-4by3">
      <img src="https://bulma.io/images/placeholders/1280x960.png" alt="Placeholder image">
    </figure>
  </div>
</div>
</div>

</div>
</template>