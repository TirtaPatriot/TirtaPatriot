<script lang="ts" setup>
defineProps({ tag: String, list: Boolean, title: String })

const socials = useState('socials', () => [
  // {
  //   title: 'Google Bisnis',
  //   icon: 'i-mdi:google-maps',
  //   color: '#4285f4',
  //   href: 'https://g.page/TirtaPatriot',
  // },
  {
    title: 'WhatsApp',
    color: 'green',
    icon: 'i-mdi:whatsapp',
    href: 'https://wa.me/6287875163845',
  },

  {
    title: 'Telegram',
    color: '#0088cc',
    icon: 'i-mdi:telegram',
    href: 'https://t.me/TirtaPatriot',
  },
  {
    title: 'Instagram',
    icon: 'i-mdi:instagram',
    href: 'https://instagram.com/TirtaPatriot',
    color: '#c32aa3',
  },
  {
    title: 'Facebook',
    icon: 'i-mdi:facebook',
    color: '#1877f2',
    href: 'https://www.facebook.com/PerumdaTirtaPatriot',
  },

  {
    title: 'X',
    icon: 'i-mdi:twitter',
    color: 'black',
    href: 'https://x.com/TirtaPatriot',
  },
])
</script>

<template>
  <template v-if="!list">
    <v-btn v-for="s of socials" :key="s.title" v-bind:="s" />
  </template>
  <!-- <v-row v-if="!list" v-bind="$attrs" justify="center">
    <v-col v-for="s of socials" :key="s.title" md="1">
      <v-btn v-bind:="s" />
    </v-col>
  </v-row> -->
  <v-list v-else>
    <v-list-subheader v-if="title" class="text-title font-weight-bold text-uppercase">
      {{ title }}
    </v-list-subheader>
    <v-list-item
      v-for="s of socials" :key="s.href"
      :title="s.title"
      :href="s.href"
      rounded="shaped"
      :prepend-icon="s.icon"
      append-icon="i-mdi:launch"
      rel="external nofollow"
    />
  </v-list>
</template>

<style>

</style>
