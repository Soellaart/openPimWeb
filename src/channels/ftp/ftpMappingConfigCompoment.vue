<template>
  <div class="ftp-mapping">
    <h2>Header Mapping Configuration</h2>
    <p>Map the external CSV header to a local item attribute:</p>

    <div
      class="mapping-row"
      v-for="(localAttr, externalHeader) in localHeaderMap"
      :key="externalHeader"
    >
      <label>External Header: <strong>{{ externalHeader }}</strong></label>
      <v-autocomplete
        v-model="localHeaderMap[externalHeader]"
        :items="availableAttributes"
        placeholder="Local Attribute"
        dense
        solo
        clearable
      />
      <button @click="removeHeader(externalHeader)">Remove</button>
    </div>

    <div class="add-row">
      <input v-model="newExternal" placeholder="New External Header" />
      <v-autocomplete
        v-model="newLocal"
        :items="availableAttributes"
        placeholder="Local Attribute"
        dense
        solo
        clearable
      />
      <button @click="addHeader()">Add</button>
    </div>

  </div>
</template>

<script>
export default {
  name: 'FTPMappingConfigComponent',
  props: {
    attributes: Array,
    channel: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      localHeaderMap: {},
      newExternal: '',
      newLocal: '',
      availableAttributes: [],
      headers: [],
      selectedAttribute: null
    }
  },
  async created () {
    await Promise.all([
      this.fetchAvailableAttributes(),
      this.fetchHeadersFromRemoteFile()
    ])
  },
  methods: {
    onHeadersExtracted (headers) {
      this.headers = headers // Update headers
    },
    async fetchAvailableAttributes () {
      try {
        const response = await fetch('/api/getAttributes')
        if (response.ok) {
          this.availableAttributes = await response.json()
        }
      } catch (err) {
        console.error('Attribute fetch failed:', err)
      }
    },
    async fetchHeadersFromRemoteFile () {
      try {
        const response = await fetch(`/api/getHeaders?channelId=${this.channel.id}`)
        if (response.ok) {
          const headers = await response.json()
          this.prefillHeaders(headers)
        } else {
          this.initEmptyHeaders()
        }
      } catch (error) {
        this.initEmptyHeaders()
      }
    },
    prefillHeaders (headers) {
      this.localHeaderMap = {}
      headers.forEach(header => {
        this.$set(this.localHeaderMap, header, '')
      })
    },
    initEmptyHeaders () {
      this.localHeaderMap = {}
    },
    addHeader () {
      if (this.newExternal && this.newLocal) {
        this.$set(this.localHeaderMap, this.newExternal, this.newLocal)
        this.newExternal = ''
        this.newLocal = ''
      }
    },
    removeHeader (externalHeader) {
      this.$delete(this.localHeaderMap, externalHeader)
    }
  },
  mounted () {
    this.$root.$on('headersExtracted', this.onHeadersExtracted)
  },
  beforeDestroy () {
    this.$root.$off('headersExtracted', this.onHeadersExtracted)
  }
}
</script>

<style scoped>
.ftp-mapping {
  max-width: 600px;
}
.mapping-row {
  margin-bottom: 1rem;
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
