<template>
  <div class="meet">

    <RecordingIcon :isRecording="meetingName.length > 0"></RecordingIcon>
    <h1 v-if="!meetingName" class="waiting">No meeting in progress<br>Waiting for a new one</h1>
    <div v-if="meetingName">

      <h1>Meeting in progress: {{meetingName}}</h1>
      <p style="margin-top: -20px">Current time: {{meetingTime}}</p>

      <Grammarly :clientId="clientId">

        <div :class="{ odd: index%2 === 0 }" class="speach" v-for="(item, index) in speeches" :key="index" autofocus>
          <h2><span class="time">{{item.time}}</span> {{item.speaker}}</h2>
          <GrammarlyEditorPlugin :client-id="clientId" :config="grammarlyConfig">
            <div style="padding-left: 10px" contenteditable="true">
              {{standardText(item)}}
            </div>
          </GrammarlyEditorPlugin>

        </div>

      </Grammarly>

    </div>




  </div>
</template>



<script lang="ts">
import { defineComponent } from 'vue';
import {WsEvent} from "@/entity/wsevent";
import {Speach} from "@/entity/meet";
import RecordingIcon from "@/components/RecordingIcon.vue";
import {Grammarly, GrammarlyEditorPlugin} from "@grammarly/editor-sdk-vue";
import * as consts from '@/entity/grammarly';


export default defineComponent({
  name: 'MeetComponent',
  components: {
    Grammarly,
    RecordingIcon,
    GrammarlyEditorPlugin
  },
  data() {
    return {
      clientId: consts.Grammarly.CLIENT_ID,
      meetingName: '',
      meetingTime: '',
      grammarlyConfig: {
        activation: "immediate",
        oauthRedirectUri: "example://grammarly-auth",
        autocomplete: "on",
        toneDetector: "on"
      },
      speeches: [] as Speach[]
    }
  },
  methods: {
    standardText(s: Speach) {
      let fullText = ''
      for (const text of s.texts) {
        fullText += text
      }
      return fullText
    }
  },
  mounted() {
    this.meetingName = "teste name"

    document.addEventListener('eventHistory-listener', (e) => {
      const event = e as MessageEvent;
      const data = event.data as WsEvent

      if (data.document.length > 0) {
        const date = new Date(data.date)
        this.meetingName = data.document
        this.meetingTime = date.toTimeString()
        if (data.kind == 'speaker') {

          this.speeches.push({
            speaker: data.name,
            time:    date.toLocaleTimeString('en', {hour: "2-digit", minute: "2-digit"}),
            texts: []
          })
        }
        if (data.kind == 'text') {
          if (this.speeches.length == 0) {
            return
          }
          if (data.old != null) {
            const idx = this.speeches[this.speeches.length-1].texts.lastIndexOf(data.old)
            if (idx >= 0) {
              this.speeches[this.speeches.length-1].texts[idx] = data.new
            }else {
              this.speeches[this.speeches.length-1].texts.push(data.new)
            }
          }else {
            this.speeches[this.speeches.length-1].texts.push(data.new)
          }

        }
      }

    }, false)
  },
});
</script>

<style scoped>
.meet{
  padding: 10px;
}
.time {
  font-size: 16px;
  color: #314856;
}
.waiting{
  text-align: center;
}
.speach{
  padding-bottom: 15px;
  padding-top: 1px;
  padding-left: 10px;
}
.odd{
  background-color: #1e282d;
}
:focus-within {
  /*outline: none;*/
}

</style>