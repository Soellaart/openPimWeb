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

    <ExtMapMappingConfigComponent
      v-if="showMapping"
      :channel="channel"
      @close="onMappingClose"
    />
  </v-form>
</template>

<script>
import ExtMapMappingConfigComponent from './ftpMappingConfigCompoment.vue'

export default {
  name: 'ExtMapConfigComponent',
  components: { ExtMapMappingConfigComponent },
  props: {
    channel: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
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
  methods: {
    openMappingModal () {
      this.showMapping = true
    },
    closeMappingModal () {
      this.showMapping = false
    },
    onMappingClose () {
      this.showMapping = false
    },
    scrollToFirstInvalid () {
      this.$nextTick(() => {
        const invalid = this.$el.querySelector('.v-input--has-state .v-messages__message')
        if (invalid) invalid.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    }
  },
  computed: {
    ftpHostRules () {
      return [
        v => !!v || 'Host is required',
        v => {
          const ipRegex = /^(?:(?:\d{1,3}\.){3}\d{1,3})$/ // IPv4
          const ipv6Regex = /^(([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4})$/ // IPv6
          const hostnameRegex = /^(([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})$/ // Domain
          return ipRegex.test(v) || ipv6Regex.test(v) || hostnameRegex.test(v) || 'Invalid host (must be IP or domain)'
        }
      ]
    },
    ftpPortRules () {
      return [
        v => !!v || 'Port is required',
        v => /^\d+$/.test(v) || 'Port must be numeric',
        v => (v >= 1 && v <= 65535) || 'Port must be between 1 and 65535'
      ]
    },
    ftpUserRules () {
      return [
        v => !!v || 'Username is required'
      ]
    },
    ftpPasswordRules () {
      return [
        v => !!v || 'Password is required'
      ]
    },
    ftpRemoteDirRules () {
      return [
        v => !!v || 'Remote directory is required'
      ]
    },
    remoteFilenameRules () {
      return [
        v => !!v || 'Remote filename is required'
      ]
    }
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
