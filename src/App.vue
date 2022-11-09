<template>
  <Meet></Meet>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HelloWorld from './components/HelloWorld.vue';
import * as electron from "electron";
import IpcRendererEvent = electron.IpcRendererEvent;
import {WsEvent} from "@/entity/wsevent";
import Meet from "@/components/Meet.vue";


export default defineComponent({
  name: 'App',
  components: {
    Meet,
  },
  setup() {
    electron.ipcRenderer.send("read-all", "dad")
    electron.ipcRenderer.on("new-meet-event", function (event : IpcRendererEvent, wsEvent: WsEvent) {
      document.dispatchEvent(new MessageEvent('eventHistory-listener', {
        data: wsEvent
      }))
    })
  },
});
</script>

<style>
body {
  background-color: #1b2228;
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #8caec5;
  margin-top: 60px;
}
</style>
