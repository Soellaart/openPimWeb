<template>
<div>
  <v-snackbar
      :value="hasError"
      top
      :multi-line="true"
      :timeout="-1"
    >
    <span v-html="error"></span>
    <v-btn
      class="ml-5"
      color="error"
      @click="clearError"
    >
      {{ $t('Close') }}
    </v-btn>
  </v-snackbar>
  <v-snackbar
      :value="hasInfo"
      color="teal"
      bottom=""
      :multi-line="true"
      :timeout="-1"
    >
    <span v-html="info"></span>
    <v-btn
      class="ml-5"
      color="info"
      @click="clearInfo"
    >
      {{ $t('Close') }}
    </v-btn>
  </v-snackbar>
  <v-snackbar
      :value="hasInformation"
      color="white"
      top
      :multi-line="true"
      :timeout="-1"
    >
    <div class="d-flex justify-space-between align-center" style="width: 100%;">
      <span v-html="information" style="color: black"></span>
      <v-btn
        class="ml-5"
        color="info"
        @click="clearInformation"
      >
        {{ $t('Close') }}
      </v-btn>
    </div>
  </v-snackbar>
  <v-dialog v-model="hasConfirmation" persistent max-width="500px">
    <v-card>
      <v-card-title class="text-h6">
        {{ confirmation?.message || 'Are you sure?' }}
      </v-card-title>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="grey" @click="cancelConfirmation">{{ $t('Cancel') }}</v-btn>
        <v-btn text color="primary" @click="confirmConfirmation">{{ $t('Confirm') }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</div>

</template>
<script>
import * as errorStore from '../store/error'

export default {
  setup () {
    const {
      state: { error, hasError, info, hasInfo, information, hasInformation, confirmation, hasConfirmation },
      clearError,
      clearInfo,
      clearInformation,
      clearConfirmation
    } = errorStore.useStore()

    function confirmConfirmation () {
      if (confirmation.value && typeof confirmation.value.onConfirm === 'function') {
        confirmation.value.onConfirm()
      }
      clearConfirmation()
    }

    function cancelConfirmation () {
      if (confirmation.value && typeof confirmation.value.onCancel === 'function') {
        confirmation.value.onCancel()
      }
      clearConfirmation()
    }

    return {
      error,
      hasError,
      info,
      hasInfo,
      information,
      hasInformation,
      clearError,
      clearInfo,
      clearInformation,
      confirmation,
      hasConfirmation,
      confirmConfirmation,
      cancelConfirmation
    }
  }
}
</script>
