<template>
  <v-menu v-model="showMenuRef" :close-on-content-click="false" :nudge-width="200" offset-y>
    <template #activator="{ on: onMenu }">
      <v-tooltip bottom>
        <template #activator="{ on: onTooltip }">
          <v-btn v-on="{ ...onMenu, ...onTooltip }" icon><v-icon>mdi-information-outline</v-icon></v-btn>
        </template>
        <span>{{ $t('SystemInformation.Tooltip') }}</span>
      </v-tooltip>
    </template>
    <v-list>
      <v-list-item><v-list-item-title>{{ 'id: ' + (data.internalId || data.id) }}</v-list-item-title></v-list-item>
      <v-list-item><v-list-item-title>{{ 'identifier: ' + data.identifier }}</v-list-item-title></v-list-item>
      <v-list-item><v-list-item-title>{{ $t('CreatedBy') + ': ' + data.createdBy }}</v-list-item-title></v-list-item>
      <v-list-item><v-list-item-title>{{ $t('CreatedAt') + ': ' + dateFormat(data.createdAt, DATE_FORMAT) }}</v-list-item-title></v-list-item>
      <v-list-item><v-list-item-title>{{ $t('UpdatedBy') + ': ' + data.updatedBy }}</v-list-item-title></v-list-item>
      <v-list-item><v-list-item-title>{{ $t('UpdatedAt') + ': ' + dateFormat(data.updatedAt, DATE_FORMAT) }}</v-list-item-title></v-list-item>
    </v-list>
  </v-menu>
</template>
<script>
import { ref } from '@vue/composition-api'
import dateFormat from 'dateformat'

export default {
  props: {
    data: {
      required: true
    }
  },
  setup (props, { emit, root }) {
    const showMenuRef = ref(false)

    return {
      showMenuRef,
      dateFormat,
      DATE_FORMAT: process.env.VUE_APP_DATE_FORMAT
    }
  }
}
</script>
