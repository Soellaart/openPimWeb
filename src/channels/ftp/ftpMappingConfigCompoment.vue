<template>
  <div class="ftp-mapping">
    <h2>Header Mapping Configuration</h2>
    <p>Map external CSV headers to internal attributes:</p>

    <v-radio-group v-model="selectedExternal" column>
      <div
        class="mapping-row"
        v-for="(localAttr, externalHeader) in localHeaderMap"
        :key="externalHeader"
      >
        <label>External Header: <strong>{{ externalHeader }}</strong></label>
        <v-autocomplete
          v-model="localHeaderMap[externalHeader]"
          :items="availableAttributes"
          item-text="text"
          item-value="value"
          placeholder="Local Attribute"
          dense
          solo
          clearable
        />
        <v-radio
          :value="externalHeader"
          :disabled="!String(localHeaderMap[externalHeader] || '').trim()"
          class="ml-2"
        />
        <v-btn icon @click="removeHeader(externalHeader)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
      </v-radio-group>

    <div class="add-row">
      <v-autocomplete
        v-model="newExternal"
        :items="headerChoices"
        item-text="text"
        item-value="value"
        label="New External Header"
        dense
        solo
        clearable
        @focus="onHeaderOpen"
        @click="onHeaderOpen"
        @update:menu="v => { if (v) onHeaderOpen() }"
        >
        <template v-slot:no-data>
           <div class="d-flex align-center justify-center pa-3" style="min-height: 48px;">
             <v-progress-circular
               v-if="fetchingHeaders"
               indeterminate
               color="primary"
               size="24"
             />
             <span v-else>No headers available</span>
           </div>
        </template>
        </v-autocomplete>
      <v-autocomplete
        v-model="newLocal"
        :items="availableAttributes"
        item-text="text"
        item-value="value"
        label="Local Attribute"
        dense
        solo
        clearable
      />
      <v-btn @click="addHeader" :disabled="!newExternal || !newLocal" color="primary">Add</v-btn>
    </div>
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from '@vue/composition-api'
import * as attrStore from '../../store/attributes'
import * as langStore from '../../store/languages'

export default {
  name: 'FTPMappingConfigComponent',
  props: {
    channel: {
      type: Object,
      required: true
    },
    headers: {
      type: Array,
      default: () => []
    },
    ensureHeaders: {
      type: Function,
      default: null
    }
  },
  setup (props, { root }) {
    const { languages, currentLanguage, defaultLanguageIdentifier } = langStore.useStore()
    const { loadAllAttributes, getAllItemsAttributes } = attrStore.useStore()

    const cleanKey = (k) => {
      if (k == null) return ''
      let s = String(k).trim()
      if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
        s = s.slice(1, -1).trim()
      }
      s = s.replace(/\\"/g, '"').replace(/\\'/g, "'")
      return s
    }

    const normalizeMap = (mapObj) => {
      const merged = {}
      for (const [k, v] of Object.entries(mapObj || {})) {
        const nk = cleanKey(k)
        const val = String(v || '').trim()
        if (!(nk in merged) || (val && !merged[nk])) merged[nk] = val
      }
      return merged
    }

    const localHeaderMap = ref({ ...props.channel.headerMappings || {} })
    const newExternal = ref('')
    const newLocal = ref('')
    const availableAttributes = ref([])
    const selectedExternal = ref(props.channel.dataIdentifier?.csvIdentifier || '')
    console.debug(props.channel)

    const headerChoices = computed(() => {
      const set = new Set((props.headers || []).map(h => cleanKey(h)).filter(Boolean))
      return [...set].map(k => ({ text: k, value: k }))
    })

    const syncDataIdentifier = () => {
      const csv = String(selectedExternal.value || '').trim()
      const pim = String((localHeaderMap.value && localHeaderMap.value[csv]) || '').trim()
      if (csv && pim) {
        props.channel.dataIdentifier = { csvIdentifier: csv, pimIdentifier: pim }
      } else {
        if (props.channel.dataIdentifier) delete props.channel.dataIdentifier
      }
    }

    const reselectFromChannel = () => {
      const di = props.channel?.dataIdentifier
      if (di && di.csvIdentifier) {
        const csv = cleanKey(di.csvIdentifier)
        const pim = String(di.pimIdentifier || '').trim()
        if (csv) {
          if (!Object.prototype.hasOwnProperty.call(localHeaderMap.value, csv)) {
            root.$set(localHeaderMap.value, csv, pim)
          } else if (!localHeaderMap.value[csv] && pim) {
            localHeaderMap.value[csv] = pim
          }
          if (String(localHeaderMap.value[csv] || '').trim()) {
            selectedExternal.value = csv
            return
          }
        }
      }
      selectFirstValid()
    }

    const selectFirstValid = () => {
      for (const [ext, loc] of Object.entries(localHeaderMap.value || {})) {
        const csv = cleanKey(ext)
        const pim = String(loc || '').trim()
        if (csv && pim) {
          selectedExternal.value = csv
          return true
        }
      }
      return false
    }

    const addHeader = () => {
      const ext = cleanKey(newExternal.value)
      const loc = String(newLocal.value || '').trim()
      if (!ext) return
      if (!Object.prototype.hasOwnProperty.call(localHeaderMap.value, ext)) {
        root.$set(localHeaderMap.value, ext, loc)
      } else {
        localHeaderMap.value[ext] = loc
      }
      localHeaderMap.value = normalizeMap(localHeaderMap.value)
      props.channel.headerMappings = { ...localHeaderMap.value }
      newExternal.value = ''
      newLocal.value = ''
    }

    const removeHeader = (externalHeader) => {
      delete localHeaderMap.value[externalHeader]
      props.channel.headerMappings = { ...localHeaderMap.value }
    }

    const fetchingHeaders = ref(false)

    const onHeaderOpen = async () => {
      if (!props.ensureHeaders) return
      if (Array.isArray(props.headers) && props.headers.length > 0) return
      try {
        fetchingHeaders.value = true
        await props.ensureHeaders()
      } finally {
        fetchingHeaders.value = false
      }
    }

    watch(() => props.channel, () => {
      // refresh local map from current headerMappings
      localHeaderMap.value = normalizeMap(props.channel.headerMappings || {})
      reselectFromChannel()
    })

    // if only the dataIdentifier changes
    watch(() => props.channel?.dataIdentifier, () => {
      reselectFromChannel()
    }, { deep: true })

    watch(selectedExternal, () => {
      syncDataIdentifier()
    })

    watch(localHeaderMap, (map) => {
      props.channel.headerMappings = { ...map }
      const sel = String(selectedExternal.value || '').trim()
      if (sel && !String(map[sel] || '').trim()) {
        selectedExternal.value = ''
      }
      syncDataIdentifier()
    }, { deep: true })

    watch(
      localHeaderMap,
      (map) => {
        props.channel.headerMappings = { ...map }
        syncDataIdentifier()
      },
      { deep: true }
    )

    watch(
      () => props.headers,
      (newHeaders) => {
        localHeaderMap.value = normalizeMap(localHeaderMap.value)

        if (Array.isArray(newHeaders) && newHeaders.length > 0) {
          const plain = JSON.parse(JSON.stringify(newHeaders))
          for (const h of plain) {
            const key = cleanKey(h)
            if (!key) continue
            if (!Object.prototype.hasOwnProperty.call(localHeaderMap.value, key)) {
              root.$set(localHeaderMap.value, key, '')
            }
          }
        }
        props.channel.headerMappings = { ...localHeaderMap.value }
        if (!String(selectedExternal.value || '').trim()) {
          selectFirstValid()
        }
      }, { immediate: true })

    watch(localHeaderMap, (map) => {
      props.channel.headerMappings = { ...map }
      const sel = String(selectedExternal.value || '').trim()
      if (sel && !String(map[sel] || '').trim()) {
        selectedExternal.value = ''
      }
      if (!selectedExternal.value) {
        selectFirstValid()
      }
      syncDataIdentifier()
    }, { deep: true })

    onMounted(() => {
      reselectFromChannel()
    })

    onMounted(async () => {
      await loadAllAttributes()
      const attrs = getAllItemsAttributes()
      const options = [{ value: '$id', text: 'ID' }, { value: '$parentId', text: 'Parent ID' }]

      for (const lang of languages) {
        const langText = ` (${lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']'})`
        options.push({ value: `$name#${lang.identifier}`, text: `Name${langText}` })
      }

      for (const attr of attrs) {
        const nameText = attr.name[currentLanguage.value.identifier] || '[' + attr.name[defaultLanguageIdentifier.value] + ']'
        if (attr.languageDependent) {
          for (const lang of languages) {
            const langText = ` (${lang.name[currentLanguage.value.identifier] || '[' + lang.name[defaultLanguageIdentifier.value] + ']'})`
            options.push({ value: `${attr.identifier}#${lang.identifier}`, text: `${nameText}${langText}` })
          }
        } else {
          options.push({ value: attr.identifier, text: nameText })
        }
      }
      availableAttributes.value = options
    })

    onMounted(() => {
      const di = props.channel.dataIdentifier
      if (di && di.csvIdentifier) {
        const k = di.csvIdentifier
        if (!Object.prototype.hasOwnProperty.call(localHeaderMap.value, k)) {
          root.$set(localHeaderMap.value, k, di.pimIdentifier || '')
        } else if (!localHeaderMap.value[k] && di.pimIdentifier) {
          localHeaderMap.value[k] = di.pimIdentifier
        }
        selectedExternal.value = k
        props.channel.headerMappings = { ...localHeaderMap.value }
      }
    })

    return {
      localHeaderMap,
      newExternal,
      newLocal,
      availableAttributes,
      headerChoices,
      cleanKey,
      normalizeMap,
      addHeader,
      removeHeader,
      selectedExternal,
      onHeaderOpen,
      fetchingHeaders
    }
  }
}
</script>

<style scoped>
.ftp-mapping {
  max-width: 600px;
}
.mapping-row {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}
label {
  display: inline-block;
  width: 180px;
  font-weight: bold;
}
.add-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-top: 1rem;
}
</style>
