<!--.vitepress/theme/MyLayout.vue-->
<script setup>
import DefaultTheme from 'vitepress/theme'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <img src="./vitepress-logo-large.svg" alt="VitePress Logo" class="hero-video"
        style="z-index: 10; position: relative;" />
    </template>

  </Layout>
</template>

<style scoped>


/* Phone and tablet: the hero stacks, so span the full content column and let
   the height follow the image's aspect ratio. */
.hero-video {
  display: block;
  width: 100%;
  height: auto;
}

/* Desktop: size to the image's own aspect ratio rather than filling the
   column. With width:100% the SVG letterboxes and draws centred inside a
   wider box, so the card never reaches the right edge. No auto margins, so
   the flex container can align it right. */
@media (min-width: 960px) {
  .hero-video {
    margin: 0;
    width: auto;
    height: 450px;
  }
}
</style>