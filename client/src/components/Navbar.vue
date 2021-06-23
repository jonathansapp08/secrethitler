<template>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css"
  />
  <nav
    class="navbar is-fixed-top color"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <div class="navbar-item">
        <router-link to="/">
          <img src="../assets/logo.png" />
        </router-link>
      </div>

      <a
        role="button"
        class="navbar-burger burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
        @click="isOpen = !isOpen" v-bind:class="{'is-active': isOpen}"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu" v-bind:class="{'is-active': isOpen}">
      <div class="navbar-start">
        <div class="navbar-item">
          <router-link to="/about" @click="isOpen = !isOpen">About Us</router-link>
        </div>

        <div class="navbar-item">
          <router-link to="/episodes" @click="isOpen = !isOpen">Episodes</router-link>
        </div>

        <div class="navbar-item">
          <router-link to="/contact" @click="isOpen = !isOpen">Contact</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      isOpen: false
    };
  }
};
</script>

<style scoped>
@media screen and (min-width: 1025px) {
  .navbar-item.is-hoverable:hover .navbar-dropdown {
    display: block !important;
  }
  .navbar-item.is-hoverable:focus-within .navbar-dropdown {
    display: none;
  }
}
/* Small devices (portrait tablets and large phones, 600px and up) */
@media only screen and (min-width: 1024px) {
  .is-active a {
    color: #ffffff !important;
  }
}
body.has-navbar-fixed-top,
html.has-navbar-fixed-top {
  padding-top: 5.25rem;
}
.navbar-item img {
  max-height: 4.5rem;
}
.navbar-burger {
  height: 4.25rem;
}
.burger {
  margin-top: 1rem;
  color: #ffffff;
}
.navbar-start a {
  text-decoration: none;
  color: #ffffff;
}
.navbar-dropdown a {
  text-decoration: none;
  color: #000000;
}
.is-active a {
  color: #000000;
}
.color {
  background-color: #219ebc;
}
</style>