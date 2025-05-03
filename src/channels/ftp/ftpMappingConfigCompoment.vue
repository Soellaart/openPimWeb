<template>
  <div class="ftp-mapping">
    <h2>Header Mapping Configuration</h2>

    <p>Here, map the external CSV header to the local item attribute:</p>

    <div class="mapping-row" v-for="(localAttr, externalHeader) in localHeaderMap" :key="externalHeader">
      <label>External Header: <strong>{{ externalHeader }}</strong></label>
      <input
        v-model="localHeaderMap[externalHeader]"
        placeholder="Local Attribute"
      />
      <button @click="removeHeader(externalHeader)">Remove</button>
    </div>

    <!-- Add new mapping row UI -->
    <div class="add-row">
      <input v-model="newExternal" placeholder="New External Header" />
      <input v-model="newLocal" placeholder="Local Attribute" />
      <button @click="addHeader()">Add</button>
    </div>

    <button @click="saveMapping">Save Mapping</button>
  </div>
</template>

<script>
export default {
  name: 'ExtMapMappingConfigCompoment',
  props: {
    channel: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      localHeaderMap: {},
      newExternal: '',
      newLocal: ''
    }
  },
  created () {
    // We read the existing channel.headerMappings object, or fallback to an empty object
    this.localHeaderMap = this.channel.headerMappings || {}
  },
  methods: {
    addHeader () {
      if (this.newExternal && this.newLocal) {
        this.$set(this.localHeaderMap, this.newExternal, this.newLocal)
        this.newExternal = ''
        this.newLocal = ''
      }
    },
    removeHeader (externalHeader) {
      this.$delete(this.localHeaderMap, externalHeader)
    },
    saveMapping () {
      // Save the local map back into the channel object
      this.channel.headerMappings = { ...this.localHeaderMap }
      // You might also call an API or emit an event to persist the channel changes
      this.$emit('close', this.channel)
    }
  }
}
</script>

<style scoped>
.ftp-mapping {
  max-width: 600px;
}
.mapping-row {
  margin-bottom: 8px;
}
label {
  display: inline-block;
  width: 160px;
  font-weight: bold;
}
.add-row {
  margin-top: 1rem;
}
</style>
