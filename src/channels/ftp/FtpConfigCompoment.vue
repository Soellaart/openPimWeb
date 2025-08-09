<template>
  <v-form ref="formRef" v-model="formValid" lazy-validation class="ftp-config">
    <h2>FTP Channel Configuration</h2>

    <v-text-field v-model="channel.config.ftpHost" :rules="ftpHostRules" label="Host" placeholder="sftp.example.com" required />
    <v-text-field v-model="channel.config.ftpPort" type="number" :rules="ftpPortRules" label="Port" placeholder="22" required />
    <v-text-field v-model="channel.config.ftpUser" :rules="ftpUserRules" label="Username" required />
    <v-text-field
      v-model="channel.config.ftpPassword"
      :type="showPassword ? 'text' : 'password'"
      :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append="showPassword = !showPassword"
      :rules="ftpPasswordRules"
      label="Password"
      required
    />
    <v-text-field v-model="channel.config.ftpRemoteDir" :rules="ftpRemoteDirRules" label="Remote Dir" placeholder="/some/path" required />
    <v-text-field v-model="channel.config.remoteFilename" :rules="remoteFilenameRules" label="Remote Filename" placeholder="import.csv or export.csv" required />

    <v-checkbox v-model="useMapping" label="Enable Custom Headers Mapping?" />

    <div v-if="useMapping">
      <v-btn @click="openMappingModal">Edit Header Mapping</v-btn>
    </div>
    <div v-if="!useMapping">
      <v-btn @click="closeMappingModal">Edit Header Mapping</v-btn>
    </div>

    <div class="field">

    </div>

    <ftpMappingConfigComponent
      v-if="showMapping"
      :channel="channel"
      :headers="localHeaders"
      @close="onMappingClose"
    />
  </v-form>
</template>

<script>
import { watch } from '@vue/composition-api'
import ftpMappingConfigComponent from './ftpMappingConfigCompoment.vue'

export default {
  name: 'ftpConfigComponent',
  components: { ftpMappingConfigComponent },
  props: {
    channel: {
      type: Object,
      required: true
    },
    headers: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      localHeaders: [...this.headers],
      useMapping: false,
      showMapping: false,
      formValid: false,
      showPassword: false
    }
  },
  created () {
    if (this.channel.headerMappings && Object.keys(this.channel.headerMappings).length > 0) {
      this.useMapping = true
    }
  },
  setup (props, { root }) {
    watch(() => props.channel, (chan) => {
      if (chan && !chan.config.ftpHost) {
        root.$set(chan.config, 'ftpHost', '')
      }
      if (chan && !chan.config.ftpPort) {
        root.$set(chan.config, 'ftpPort', 22)
      }
      if (chan && !chan.config.ftpUser) {
        root.$set(chan.config, 'ftpUser', '')
      }
      if (chan && !chan.config.ftpPassword) {
        root.$set(chan.config, 'ftpPassword', '')
      }
      if (chan && !chan.config.ftpRemoteDir) {
        root.$set(chan.config, 'ftpRemoteDir', '/')
      }
      if (chan && !chan.config.remoteFilename) {
        root.$set(chan.config, 'remoteFilename', '')
      }
    })
  },
  methods: {
    openMappingModal () {
      this.localHeaders = Array.isArray(this.headers) ? [...this.headers] : []
      this.showMapping = true
    },
    closeMappingModal () {
      this.showMapping = false
    },
    onMappingClose () {
      this.showMapping = false
    }
  },
  beforeDestroy () {
    this.$root.$off('headersExtracted')
  }
}
</script>

<style scoped>
.ftp-config {
  max-width: 600px;
}
.field {
  margin-bottom: 1rem;
}
label {
  display: inline-block;
  width: 140px;
  font-weight: bold;
}
.disabled-button {
  opacity: 0.5;
  pointer-events: none;
}
</style>
