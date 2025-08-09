<template>
  <div class="ftp-mapping">
    <h2>Header Mapping Configuration</h2>
    <p>Map external CSV headers to internal attributes:</p>

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
      <v-btn icon @click="removeHeader(externalHeader)">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
    </div>

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
      />
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
      default: () => [] // Default empty array
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

    // Cleaned, unique headers for the dropdown (used in template)
    const headerChoices = computed(() => {
      const set = new Set((props.headers || []).map(h => cleanKey(h)).filter(Boolean))
      return [...set].map(k => ({ text: k, value: k }))
    })

    watch(
      localHeaderMap,
      (map) => {
        props.channel.headerMappings = { ...map }
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
            // important for Vue 2 reactivity:
              root.$set(localHeaderMap.value, key, '')
            }
          }
        }

        // push to parent for saving
        props.channel.headerMappings = { ...localHeaderMap.value }
      },
      { immediate: true }
    )

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

    const addHeader = () => {
      const ext = cleanKey(newExternal.value)
      const loc = String(newLocal.value || '').trim()
      if (!ext) return
      // ensure reactivity when key didn’t exist:
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

    return {
      localHeaderMap,
      newExternal,
      newLocal,
      availableAttributes,
      headerChoices,
      cleanKey,
      normalizeMap,
      addHeader,
      removeHeader
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
