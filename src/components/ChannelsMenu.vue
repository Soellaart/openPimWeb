<template>
  <div>
    <v-text-field v-model="searchRef" @input="clearSelection" :label="$t('Filter')" flat hide-details clearable
      clear-icon="mdi-close-circle-outline" class="ml-5 mr-5"></v-text-field>
    <v-list :expand="!!searchRef" nav dense>
      <v-list-group v-for="group in groupedChannels" :key="group.id" prepend-icon="mdi-folder"
        @click="itemRef = group.id"
        :value="group.children.some(child => itemRef === child.id) || itemRef === group.id || !!searchRef">
        <template v-slot:activator>
          <v-list-item-content>
            <v-list-item-title>
              {{ group.name[currentLanguage.identifier] || `[${group.name[defaultLanguage]}]` }}
            </v-list-item-title>
          </v-list-item-content>
        </template>
        <v-row>
          <v-col cols="1"></v-col>
          <v-col>
            <v-list-item v-for="child in group.children" :key="child.id"
              @click="itemRef = (itemRef === child.id ? null : child.id)"
              :class="{ 'v-item--active': itemRef === child.id, 'v-list-item--active': itemRef === child.id }">
              <v-list-item-icon>
                <v-icon>mdi-access-point</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>
                  {{ child.name[currentLanguage.identifier] || `[${child.name[defaultLanguage]}]` }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-col>
        </v-row>
      </v-list-group>

      <v-list-item v-for="chan in singleChannels" :key="chan.id"
        @click="itemRef = (itemRef === chan.id ? null : chan.id)"
        :class="{ 'v-item--active': itemRef === chan.id, 'v-list-item--active': itemRef === chan.id, 'primary--text': itemRef === chan.id }">
        <v-list-item-icon>
          <v-icon>mdi-access-point</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>
            {{ chan.name[currentLanguage.identifier] || `[${chan.name[defaultLanguage]}]` }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </div>
</template>
<script>
import * as langStore from '../store/languages'
import * as channelsStore from '../store/channels'
import router from '../router'
import { ref, watch, onMounted, computed } from '@vue/composition-api'
import { useRouter } from '../router/useRouter'

export default {
  setup () {
    const { route } = useRouter()

    const {
      currentLanguage,
      defaultLanguageIdentifier
    } = langStore.useStore()

    const {
      loadAllChannels,
      getAvailableChannels
    } = channelsStore.useStore()

    const itemRef = ref(null)
    const channelsRef = ref(null)

    function filteredChannels () {
      if (!channelsRef.value) return []
      const arr = channelsRef.value
      const result = []
      const chanMap = {}

      arr.forEach(chan => {
        chanMap[chan.id] = { ...chan, children: [] }
      })

      arr.forEach(chan => {
        if (chan.parentId) {
          const parent = chanMap[chan.parentId]
          if (parent) {
            parent.children.push(chanMap[chan.id])
          }
        } else if (chan.group || (chan.parentId === 0 && !chan.group)) {
          result.push(chanMap[chan.id])
        }
      })

      result.forEach(group => {
        if (group.children.length > 0) {
          group.children.sort((a, b) => a.order - b.order)
        }
      })

      if (searchRef.value) {
        const searchTerm = searchRef.value.toLowerCase()
        const filteredResult = []

        result.forEach(group => {
          const identifierMatch = group.identifier.toLowerCase().includes(searchTerm)
          const nameMatch = group.name && Object.values(group.name).some(val => val.toLowerCase().includes(searchTerm))

          if (identifierMatch || nameMatch) {
            filteredResult.push(group)
          } else {
            const filteredChildren = group.children.filter(child => {
              const childIdentifierMatch = child.identifier.toLowerCase().includes(searchTerm)
              const childNameMatch = child.name && Object.values(child.name).some(val => val.toLowerCase().includes(searchTerm))
              return childIdentifierMatch || childNameMatch
            })

            if (filteredChildren.length > 0) {
              filteredResult.push({
                ...group,
                children: filteredChildren
              })
            }
          }
        })

        return filteredResult
      }

      return result
    }

    const groupedChannels = computed(() => {
      return filteredChannels().filter(item => item.group).sort((a, b) => a.order - b.order)
    })

    const singleChannels = computed(() => {
      return filteredChannels().filter(item => !item.group).sort((a, b) => a.order - b.order)
    })

    const searchRef = ref('')
    function clearSelection () {
      itemRef.value = null
    }

    watch(itemRef, (selected, previous) => {
      if (selected == null) {
        if (previous != null) router.push('/channels')
        return
      }

      let val

      val = groupedChannels.value.find(item => item.id === selected)

      if (!val) {
        for (const group of groupedChannels.value) {
          val = group.children.find(child => child.id === selected)
          if (val) break
        }
      }

      if (!val) {
        val = singleChannels.value.find(item => item.id === selected)
      }

      if (val) {
        const selectedChannel = val
        if (selectedChannel.internalId !== 0 && selectedChannel.identifier && !selectedChannel.group) {
          router.push('/channels/' + selectedChannel.identifier)
        }
      }
    })

    onMounted(() => {
      loadAllChannels().then(() => {
        clearSelection()
        channelsRef.value = getAvailableChannels()
        if (route.value && route.value.params && route.value.params.id) {
          itemRef.value = channelsRef.value.find(elem => elem.identifier === route.value.params.id).id
        }
      })
    })

    return {
      singleChannels,
      groupedChannels,
      filteredChannels,
      itemRef,
      currentLanguage,
      defaultLanguageIdentifier,
      channelsRef,
      clearSelection,
      searchRef
    }
  }
}
</script>
