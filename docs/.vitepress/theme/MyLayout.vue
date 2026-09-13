<!--.vitepress/theme/MyLayout.vue-->
<script setup>
import DefaultTheme from 'vitepress/theme'
import { withBase } from 'vitepress'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero-image>
      <!-- autoplay only works alongside `muted`; the clip carries an audio
           track, so browsers would otherwise refuse to start it. -->
      <video
        class="hero-video"
        :src="withBase('/glacier.mp4')"
        autoplay
        muted
        loop
        playsinline
        disablepictureinpicture
        aria-label="Simulated crevasse propagation in a glacier"
        style="z-index: 10; position: relative;"
      />
    </template>

  </Layout>
</template>

<style scoped>


/* Phone and tablet: the hero stacks, so span the full content column and let
   the height follow the video's aspect ratio. */
.hero-video {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  /* Hairline edge, using the theme's separator colour so it reads correctly
     in both appearances. border-box keeps the outer size at the value set
     below, so the border does not nudge the hero alignment. */
  border: 1px solid var(--vp-c-divider);
  box-sizing: border-box;
  /* Preserve the frame when a max-width clamp fights the fixed height below,
     rather than stretching the picture. */
  object-fit: contain;
}

/* Desktop: size to the video's own aspect ratio rather than filling the
   column, so the element box matches what is actually drawn and can be
   aligned flush right. No auto margins, so the flex container can do it. */
@media (min-width: 960px) {
  .hero-video {
    margin: 0;
    width: auto;
    height: 450px;
    max-width: 100%;
  }
}
</style>
