<template>
  <div class="ftp-config">
    <h2>FTP Channel Configuration</h2>

    <div class="field">
      <label>Host:</label>
      <input v-model="channel.config.ftpHost" placeholder="sftp.example.com" />
    </div>
    <div class="field">
      <label>Port:</label>
      <input type="number" v-model="channel.config.ftpPort" placeholder="22" />
    </div>
    <div class="field">
      <label>Username:</label>
      <input v-model="channel.config.ftpUser" />
    </div>
    <div class="field">
      <label>Password:</label>
      <input type="password" v-model="channel.config.ftpPassword" />
    </div>
    <div class="field">
      <label>Remote Dir:</label>
      <input v-model="channel.config.ftpRemoteDir" placeholder="/some/path" />
    </div>
    <div class="field">
      <label>Remote Filename:</label>
      <input v-model="channel.config.remotefilename" placeholder="import.csv or export.csv" />
    </div>

    <div class="field">
      <label>Enable Custom Headers Mapping?</label>
      <input type="checkbox" v-model="useMapping" />
    </div>

    <div v-if="useMapping" class="field">
      <button @click="openMappingModal">Edit Header Mapping</button>
    </div>

    <div class="field">
      <label>Edit Configuration:</label>
      <v-tooltip bottom v-if="!mappingSaved">
        <template v-slot:activator="{ on, attrs }">
      <span v-bind="attrs" v-on="on">
        <button disabled class="disabled-button">Edit Configuration</button>
      </span>
        </template>
        <span>Save first</span>
      </v-tooltip>
      <button
        v-else
        @click="goToConfiguration"
      >Edit Configuration</button>
    </div>

    <div class="field">
      <label>Test Configuration:</label>
      <button @click="testConfiguration">Test</button>
    </div>

    <ExtMapMappingConfigComponent
      v-if="showMapping"
      :channel="channel"
      @close="onMappingClose"
      @mapping-saved="onMappingSaved"
    />
  </div>
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
      mappingSaved: false,
      channel: {
        config: {
          ftpHost: '',
          ftpPort: 22,
          ftpUser: '',
          ftpPassword: '',
          ftpRemoteDir: '',
          remotefilename: ''
        },
        headerMappings: {}
      }
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
    onMappingClose () {
      this.showMapping = false
    },
    onMappingSaved () {
      this.mappingSaved = true
    },
    goToConfiguration () {
      // Add your config navigation logic here
      alert('Opening configuration panel...')
    },
    async testConfiguration () {
      try {
        // Save the channel configuration
        await this.saveChannel()

        // Run the test to check if the file is found and get headers
        const response = await fetch(`/api/testConfiguration?channelId=${this.channel.id}`)
        if (response.ok) {
          const headers = await response.json()
          alert('File found! Headers retrieved.')
          // Navigate to the edit configuration page with headers
          this.goToConfigurationWithHeaders(headers)
        } else {
          alert('File not found or error occurred.')
        }
      } catch (error) {
        console.error('Test failed:', error)
        alert('An error occurred during the test.')
      }
    },
    async saveChannel () {
      // Logic to save the channel configuration
      console.log('Saving channel configuration...')
      // Add your save logic here
    },
    goToConfigurationWithHeaders (headers) {
      // Logic to navigate to the edit configuration page with headers
      console.log('Navigating to configuration with headers:', headers)
      // Add your navigation logic here
    }
  }
}
</script>

<style scoped>
.ftp-config {
  max-width: 500px;
}
.field {
  margin-bottom: 1rem;
}
label {
  display: inline-block;
  width: 120px;
  font-weight: bold;
}
.disabled-button {
  opacity: 0.5;
  pointer-events: none;
}
</style>
