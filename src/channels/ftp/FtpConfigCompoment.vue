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

    <!-- Additional booleans, advanced toggles, etc. -->
    <div class="field">
      <label>Enable Custom Headers Mapping?</label>
      <input type="checkbox" v-model="useMapping" />
    </div>

    <!-- If useMapping is true, show a button or link to the mapping UI. -->
    <div v-if="useMapping">
      <button @click="openMappingModal">Edit Header Mapping</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExtMapConfigCompoment',
  props: {
    // Typically your parent passes in the "channel" object
    // that your code reads & writes to:
    channel: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      useMapping: false
    }
  },
  created () {
    // If channel.headerMappings is already set, let's say that means "useMapping = true"
    if (this.channel.headerMappings && Object.keys(this.channel.headerMappings).length > 0) {
      this.useMapping = true
    }
  },
  methods: {
    openMappingModal () {
      // Logic to open a modal or route to another component
      // that displays ExtMapMappingConfigCompoment, for example
      // This depends on how your app is structured
      this.$emit('open-mapping', this.channel)
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
</style>
