<template>
  <div class="container">
    <div :class="{'recording-circle': isRecording, 'not-recording-circle': !isRecording}" ></div>
    <div class="recording-text" v-if="isRecording">Recording</div>
    <div class="recording-text" v-if="!isRecording">Stopped</div>
  </div>
</template>

<script>
export default {
  name: "RecordingIcon",
  props: {
    isRecording: Boolean,
  },

}
</script>

<style scoped>
.container {
  left: 10px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: left;
  padding: 0.25em;
  background-color: rgb(41, 45, 51);
  border-radius: 0.25em;
  width: 80px;
}

.not-recording-circle {
  width: 1em;
  height: 1em;
  border-radius: 50%;
  background-color: #515254;
  margin-right: 0.25em;
}

.recording-circle {
  width: 1em;
  height: 1em;
  border-radius: 50%;
  animation: ease pulse 2s infinite;
  margin-right: 0.25em;
}

.recording-text {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
  Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 0.75em;
  color: white;
}

@keyframes pulse {
  0% {
    background-color: #932424;
  }
  50% {
    background-color: #8d3b3b;
  }
  100% {
    background-color: #932424;
  }
}

</style>