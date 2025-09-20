<template>
  <v-row justify="center">
    <v-dialog v-model="dialogRef" persistent max-width="860px">
      <v-card>
        <v-card-title class="d-flex align-center">
          <span class="headline">{{ $t('Config.Actions.Triggers.Dialog.Title') }}</span>
          <v-spacer />
          <v-chip small v-if="typeRef" class="ml-2">{{ typeLabel }}</v-chip>
        </v-card-title>

        <v-card-text>
          <!-- TYPE / SCOPE -->
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="typeRef"
                  :items="typeSelection"
                  :label="$t('Config.Actions.Triggers.Type')"
                  dense outlined
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-radio-group  v-if="typeRef !== 9" v-model="triggerRef.event" row :disabled="!typeRef">
                  <v-radio :label="$t('Config.Actions.Triggers.Event.Always')" value="0"></v-radio>
                  <v-radio :label="$t('Config.Actions.Triggers.Event.BeforeCreate')" value="1"></v-radio>
                  <v-radio :label="$t('Config.Actions.Triggers.Event.AfterCreate')" value="2"></v-radio>
                  <v-radio :label="$t('Config.Actions.Triggers.Event.BeforeUpdate')" value="3"></v-radio>
                  <v-radio :label="$t('Config.Actions.Triggers.Event.AfterUpdate')" value="4"></v-radio>
                  <v-radio v-if="typeRef === 1 || typeRef === 5" :label="$t('Config.Actions.Triggers.Event.AttributeChanged')" value="11"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>

            <!-- CONTEXT PICKERS -->
            <v-row v-if="typeRef === 1 || typeRef === 3 || typeRef === 6 || typeRef === 9">
              <v-col cols="12" md="6" class="d-flex align-center">
                <div v-if="selectedType" class="mr-3">
                  <router-link :to="'/config/types/' + selectedType.identifier">{{ selectedType.identifier }}</router-link>
                  <span class="ml-2">- {{ selectedType.name[currentLanguage.identifier] || '[' + selectedType.name[defaultLanguageIdentifier] + ']' }}</span>
                </div>
                <v-btn small text color="primary" @click="typeSelectionDialogRef.showDialog()">
                  {{ $t('Config.Actions.Triggers.SelectType.Button') }}
                </v-btn>
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <div v-if="selectedItemRef" class="mr-3">
                  <router-link :to="'/item/' + selectedItemRef.identifier">{{ selectedItemRef.identifier }}</router-link>
                  <span class="ml-2">- {{ selectedItemRef.name[currentLanguage.identifier] || '[' + selectedItemRef.name[defaultLanguageIdentifier] + ']' }}</span>
                </div>
                <v-btn small text color="primary" @click="itemSelectionDialogRef.showDialog()">
                  {{ $t('Config.Actions.Triggers.SelectItem.Button') }}
                </v-btn>
              </v-col>
            </v-row>

            <v-row v-if="typeRef === 2">
              <v-col cols="12" class="d-flex align-center">
                <div v-if="selectedRelation" class="mr-3">
                  <router-link :to="'/config/relations/' + selectedRelation.identifier">{{ selectedRelation.identifier }}</router-link>
                  <span class="ml-2">- {{ selectedRelation.name[currentLanguage.identifier] || '[' + selectedRelation.name[defaultLanguageIdentifier] + ']' }}</span>
                </div>
                <v-btn small text color="primary" @click="relSelectionDialogRef.showDialog()">
                  {{ $t('Config.Actions.Triggers.SelectRel.Button') }}
                </v-btn>
              </v-col>
            </v-row>

            <v-row v-if="typeRef === 3 || typeRef === 6 || typeRef === 9">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="triggerRef.itemButton"
                  :label="$t('Config.Actions.Triggers.ButtonText')"
                  dense outlined
                />
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-checkbox v-model="triggerRef.askBeforeExec" :label="$t('Config.Actions.Triggers.AskBeforeExec')" hide-details class="mr-6"/>
                <v-btn small text color="primary" @click="editRoles">{{ $t('Config.Users.Roles') }}</v-btn>
              </v-col>
              <v-col cols="12" v-if="userRoles.length">
                <v-list dense class="pt-0 pb-0">
                  <v-list-item v-for="(item,i) in userRoles" :key="i" dense class="py-0">
                    <v-list-item-content class="py-0" style="display:inline">
                      <router-link :to="'/config/roles/' + item.identifier">{{ item.identifier }}</router-link>
                      <span class="ml-2">- {{ item.name }}</span>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <!-- IF BLOCK -->
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center mb-2">
                  <h3 class="mb-0">{{ $t('IF') }}</h3>
                  <v-spacer />
                  <v-btn-toggle v-model="conditionsJoin" dense mandatory class="mr-2">
                    <v-btn small value="AND">AND</v-btn>
                    <v-btn small value="OR">OR</v-btn>
                  </v-btn-toggle>
                  <v-btn small color="primary" @click="addCondition"><v-icon left>mdi-plus</v-icon>{{ $t('Add condition') }}</v-btn>
                </div>
                <v-alert v-if="!triggerRef.conditions.length" type="info" dense outlined class="mb-2">
                  {{ $t('Add at least one condition to define WHEN your action runs.') }}
                </v-alert>

                <v-card v-for="(c, idx) in triggerRef.conditions" :key="'cond-'+idx" class="pa-3 mb-2">
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-combobox
                        dense
                        outlined
                        v-model="c.left"
                        :items="variableOptions"
                        item-text="label"
                        item-value="path"
                        :label="$t('Variable')"
                        clearable
                        hide-selected
                        hide-no-data
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-select
                        dense outlined
                        v-model="c.op"
                        :items="operatorOptions"
                        :label="$t('Operator')"
                      />
                    </v-col>
                    <v-col cols="12" md="4" v-if="needsRightValue(c.op)">
                      <v-text-field
                        v-if="needsRightValue(c.op)"
                        v-model="c.right"
                        dense
                        outlined
                        :label="$t('Value')"
                      />
                    </v-col>
                    <v-col cols="12" md="1" class="d-flex align-center justify-end">
                      <v-btn icon @click="removeCondition(idx)"><v-icon>mdi-delete</v-icon></v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <!-- THEN BLOCK -->
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center mb-2">
                  <h3 class="mb-0">{{ $t('THEN') }}</h3>
                  <v-spacer />
                  <v-btn small color="primary" @click="addAction"><v-icon left>mdi-plus</v-icon>{{ $t('Add action') }}</v-btn>
                </div>
                <v-alert v-if="!triggerRef.actions.length" type="info" dense outlined class="mb-2">
                  {{ $t('Add at least one result that CHANGES the item when conditions match.') }}
                </v-alert>

                <v-card v-for="(a, idx) in triggerRef.actions" :key="'act-'+idx" class="pa-3 mb-2">
                  <v-row dense>
                    <v-col cols="12" md="4">
                      <v-combobox
                        dense
                        outlined
                        clearable
                        v-model="a.target"
                        :items="targetOptions"
                        item-text="label"
                        item-value="path"
                        :label="$t('Change field / attribute')"
                        hide-selected
                        hide-no-data
                        placeholder="e.g. values.Color"
                      />
                    </v-col>
                    <v-col cols="12" md="3">
                      <v-select
                        dense outlined
                        v-model="a.kind"
                        :items="actionKinds"
                        :label="$t('Operation')"
                      />
                    </v-col>
                    <v-col cols="12" md="4" v-if="needsActionValue(a.kind)">
                      <v-text-field
                        v-if="needsActionValue(a.kind)"
                        v-model="a.value"
                        dense
                        outlined
                        :label="$t('New value')"
                      />
                    </v-col>
                    <v-col cols="12" md="1" class="d-flex align-center justify-end">
                      <v-btn icon @click="removeAction(idx)"><v-icon>mdi-delete</v-icon></v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>

            <v-divider class="my-4"></v-divider>

            <!-- PREVIEW -->
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center">
                  <h3 class="mb-0">{{ $t('Backend preview') }}</h3>
                  <v-spacer />
                  <v-chip x-small>{{ eventLabel }}</v-chip>
                </div>
                <v-card class="mt-2 pa-3">
                  <pre class="mb-0" style="white-space:pre-wrap;"><code>{{ previewCode }}</code></pre>
                </v-card>
              </v-col>
            </v-row>

          </v-container>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="blue darken-1" @click="dialogRef = false">{{ $t('Cancel') }}</v-btn>
          <v-btn :disabled="!createEnabled" color="blue darken-1" text @click="create">{{ $t('Create') }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Existing dialogs reused -->
    <TypeSelectionDialog ref="typeSelectionDialogRef" :multiselect="false" @selected="typeSelected"/>
    <ItemsSelectionDialog ref="itemSelectionDialogRef" @selected="itemSelected"/>
    <RelationsSelectionDialog ref="relSelectionDialogRef" :multiselect="false" @selected="relationSelected"/>
    <RolesSelectionDialog ref="rolesSelectionDialogRef" :multiselect="true" @selected="rolesSelected"/>
  </v-row>
</template>

<script>

import { ref, computed, watch } from '@vue/composition-api'
import * as langStore from '../store/languages'
import * as typesStore from '../store/types'
import * as itemStore from '../store/item'
import * as relStore from '../store/relations'
import * as rolesStore from '../store/roles'
import * as actionsStore from '../store/actions'
import i18n from '../i18n'

import RolesSelectionDialog from './RolesSelectionDialog'
import TypeSelectionDialog from './TypeSelectionDialog'
import ItemsSelectionDialog from './ItemsSelectionDialog'
import RelationsSelectionDialog from './RelationsSelectionDialog'

export default {
  name: 'ActionTriggerCreationDialog',
  components: { TypeSelectionDialog, ItemsSelectionDialog, RelationsSelectionDialog, RolesSelectionDialog },

  methods: {
    showDialog () { this.dialogRef = true },
    closeDialog () { this.dialogRef = false }
  },

  setup (props, { emit }) {
    // stores
    const { currentLanguage, defaultLanguageIdentifier } = langStore.useStore()
    const { findType } = typesStore.useStore()
    const { loadItemsByIds } = itemStore.useStore()
    const { relations } = relStore.useStore()
    const { roles } = rolesStore.useStore()

    // refs
    const dialogRef = ref(false)
    const typeSelectionDialogRef = ref(null)
    const itemSelectionDialogRef = ref(null)
    const relSelectionDialogRef = ref(null)
    const rolesSelectionDialogRef = ref(null)

    const typeRef = ref(0) // 1..8
    const triggerRef = ref({
      type: 0,
      event: 0,
      itemType: 0,
      itemFrom: 0,
      relation: 0,
      itemButton: '',
      askBeforeExec: false,
      roles: [],
      conditions: [],
      actions: []
    })
    const selectedItemRef = ref(null)

    const typeSelection = [
      { text: i18n.t('Config.Actions.Triggers.Type.Item'), value: 1 },
      { text: i18n.t('Config.Actions.Triggers.Type.ItemRel'), value: 2 },
      { text: i18n.t('Config.Actions.Triggers.Type.Button'), value: 3 },
      { text: i18n.t('Config.Actions.Triggers.Type.AttrGroup'), value: 4 },
      { text: i18n.t('Config.Actions.Triggers.Type.Attribute'), value: 5 },
      { text: i18n.t('Config.Actions.Triggers.Type.TableButton'), value: 6 },
      { text: i18n.t('Config.Actions.Triggers.Type.BulkUpdateChannels'), value: 7 },
      { text: i18n.t('Config.Actions.Triggers.Type.LOV'), value: 8 },
      { text: i18n.t('Config.Actions.Triggers.Type.Fix'), value: 9 }
    ]

    // watch type updates to keep legacy fields coherent
    watch(typeRef, (val) => {
      triggerRef.value.type = val
      // reset non-applicable scope
      if (val === 1) {
        triggerRef.value.relation = 0
        triggerRef.value.itemButton = ''
      } else if (val === 2) {
        triggerRef.value.itemType = 0
        triggerRef.value.itemFrom = 0
        triggerRef.value.itemButton = ''
        selectedItemRef.value = null
      } else if (val === 3) {
        triggerRef.value.itemButton = ''
      } else if (val === 9) {
        triggerRef.value.event = 0
        triggerRef.value.itemButton = triggerRef.value.itemButton || ''
      } else {
        triggerRef.value.event = 0
        triggerRef.value.relation = 0
        selectedItemRef.value = null
      }
    })
    // roles helpers
    function editRoles () { rolesSelectionDialogRef.value.showDialog('', triggerRef.value.roles) }
    function rolesSelected (arr) { rolesSelectionDialogRef.value.closeDialog(); triggerRef.value.roles = arr }
    const userRoles = computed(() => (triggerRef.value.roles || []).map(id => roles.find(r => r.id === id || r.internalId === id)).filter(Boolean))

    // pickers
    const selectedType = computed(() => triggerRef.value.itemType ? findType(triggerRef.value.itemType).node : null)
    const selectedRelation = computed(() => triggerRef.value.relation ? relations.find(r => r.id === triggerRef.value.relation) : null)
    function typeSelected (arr) { typeSelectionDialogRef.value.closeDialog(); triggerRef.value.itemType = arr[0] }
    function itemSelected (id) {
      itemSelectionDialogRef.value.closeDialog()
      triggerRef.value.itemFrom = id
      loadItemsByIds([id], false).then(items => { selectedItemRef.value = items[0] })
    }
    function relationSelected (arr) { relSelectionDialogRef.value.closeDialog(); triggerRef.value.relation = arr[0] }

    // IF block
    const operatorOptions = [
      { text: 'equals', value: 'eq' },
      { text: 'not equals', value: 'neq' },
      { text: 'contains', value: 'contains' },
      { text: 'not contains', value: 'ncontains' },
      { text: 'is empty', value: 'empty' },
      { text: 'is not empty', value: 'nempty' },
      { text: '>', value: 'gt' },
      { text: '<', value: 'lt' },
      { text: '>=', value: 'gte' },
      { text: '<=', value: 'lte' },
      { text: 'matches regex', value: 'regex' }
    ]
    const conditionsJoin = ref('AND')

    function addCondition () {
      triggerRef.value.conditions.push({ left: null, op: 'eq', right: null, valueType: 'string' })
    }
    function removeCondition (idx) { triggerRef.value.conditions.splice(idx, 1) }

    function needsRightValue (op) {
      return !['empty', 'nempty'].includes(op)
    }

    function valueInputComponent (c) {
      // basic type toggle via operator/left heuristic; user can change by typing value
      if (['gt', 'lt', 'gte', 'lte'].includes(c.op)) return 'v-text-field'
      if (c.valueType === 'boolean') return 'v-switch'
      return 'v-text-field'
    }

    // THEN block
    const actionKinds = [
      { text: 'set', value: 'set' },
      { text: 'append (string/array)', value: 'append' },
      { text: 'increment (number)', value: 'incr' },
      { text: 'remove (clear field)', value: 'remove' }
    ]

    function addAction () { triggerRef.value.actions.push({ target: null, kind: 'set', value: null }) }
    function removeAction (idx) { triggerRef.value.actions.splice(idx, 1) }
    function needsActionValue (kind) { return kind !== 'remove' }
    function actionValueComponent (a) {
      if (a.kind === 'incr') return 'v-text-field'
      return 'v-text-field'
    }

    // Enablement
    const createEnabled = computed(() => {
      const t = Number(typeRef.value) // zorg dat het numeriek is

      // Event mag 0 zijn (Always), dus niet met truthy checken
      const hasScopeOK = !!t && triggerRef.value.event !== undefined

      // IF-blok: als event==0 (Always) -> geen condities verplicht
      const hasIf = triggerRef.value.event === 0
        ? true
        : (triggerRef.value.conditions.length > 0 &&
          triggerRef.value.conditions.every(c =>
            c.left && c.op && (needsRightValue(c.op) ? (c.right !== null && c.right !== '') : true)
          ))

      // THEN-blok: altijd minstens 1 actie
      const hasThen = triggerRef.value.actions.length > 0 &&
        triggerRef.value.actions.every(a =>
          a.target && a.kind && (needsActionValue(a.kind) ? (a.value !== null && a.value !== '') : true)
        )

      // Button-typen hebben label nodig (3,6,9)
      const needsBtn = [3, 6, 9].includes(t) ? !!triggerRef.value.itemButton : true

      // Type-specifieke minimale scope
      const scopeOK =
        (t === 1 ? (!!triggerRef.value.itemType && !!triggerRef.value.itemFrom) : true) && // item trigger
        (t === 2 ? (!!triggerRef.value.relation) : true) && // relation trigger
        (t === 3 ? (!!triggerRef.value.itemType && !!triggerRef.value.itemFrom) : true) && // button op item
        (t === 6 ? ( // table button: óf geen type+item óf beide aanwezig
          (!triggerRef.value.itemType && !triggerRef.value.itemFrom) ||
          (triggerRef.value.itemType && triggerRef.value.itemFrom)
        ) : true) &&
        (t === 9 ? (!!triggerRef.value.itemType && !!triggerRef.value.itemFrom) : true) // Fix (button) vereist type + item

      return hasScopeOK && hasIf && hasThen && needsBtn && scopeOK
    })

    // Labels
    const typeLabel = computed(() => {
      const i = (i18n.t || ((k) => k))
      const f = typeSelection.find(t => t.value === typeRef.value)
      return f ? f.text : i('Select type')
    })
    const eventLabel = computed(() => {
      const m = {
        1: 'BeforeCreate',
        2: 'AfterCreate',
        3: 'BeforeUpdate',
        4: 'AfterUpdate',
        11: 'AttributeChanged'
      }
      return m[triggerRef.value.event] || '—'
    })

    // Code preview (OpenPIM-style)
    const previewCode = computed(() => {
      const evt = parseInt(triggerRef.value.event, 10)
      const isAfter = [2, 4].includes(evt)
      const cond = renderConditions(triggerRef.value.conditions, conditionsJoin.value)
      const acts = renderActions(triggerRef.value.actions)

      let header = ''
      if (evt === 1) header = '// Object Change Trigger – Before Create'
      else if (evt === 2) header = '// Object Change Trigger – After Create'
      else if (evt === 3) header = '// Object Change Trigger – Before Update'
      else if (evt === 4) header = '// Object Change Trigger – After Update'
      else if (evt === 11) header = '// Attribute Changed'

      return `${header}
if (${cond}) {
${indent(acts, 2)}
${isAfter ? '  await item.save();\n' : ''}}`
    })

    function jsValue (v) {
      if (v === true || v === false) return String(v)
      if (v === null || v === undefined) return 'null'
      if (!isNaN(v) && v !== '') return String(v)
      const s = String(v).replace(/\\/g, '\\\\').replace(/`/g, '\\`')
      return '`' + s + '`'
    }
    function pathToJs (p) {
      // "values.Color" => item.values["Color"]
      // "values.name[lang]" => item.values.name[lang]
      if (!p) return 'item'
      let out = 'item'
      const dot = p.split('.')
      for (let i = 0; i < dot.length; i++) {
        const seg = dot[i]
        if (!seg) continue
        if (seg.includes('[')) out += '.' + seg
        else if (/^[a-zA-Z_]\w*$/.test(seg)) out += '.' + seg
        else out += '["' + seg.replace(/"/g, '\\"') + '"]'
      }
      return out
    }
    function renderConditions (arr, joiner) {
      if (!arr.length) return 'true'
      const parts = arr.map(c => {
        const left = pathToJs(c.left)
        switch (c.op) {
          case 'eq': return `${left} === ${jsValue(c.right)}`
          case 'neq': return `${left} !== ${jsValue(c.right)}`
          case 'contains': return `${left} && String(${left}).includes(${jsValue(c.right)})`
          case 'ncontains': return `!(${left} && String(${left}).includes(${jsValue(c.right)}))`
          case 'empty': return `!${left} || ${left} === ''`
          case 'nempty': return `${left} && ${left} !== ''`
          case 'gt': return `Number(${left}) > Number(${jsValue(c.right)})`
          case 'lt': return `Number(${left}) < Number(${jsValue(c.right)})`
          case 'gte': return `Number(${left}) >= Number(${jsValue(c.right)})`
          case 'lte': return `Number(${left}) <= Number(${jsValue(c.right)})`
          case 'regex': return `new RegExp(${jsValue(c.right)}).test(String(${left}))`
          default: return 'true'
        }
      })
      return parts.join(` ${joiner} `)
    }
    function renderActions (arr) {
      if (!arr.length) return ''
      const lines = []
      arr.forEach(a => {
        const tgt = pathToJs(a.target)
        // ensure we mutate known buckets (values/runtime) where needed
        switch (a.kind) {
          case 'set':
            lines.push(`${tgt} = ${jsValue(a.value)};`)
            break
          case 'append':
            lines.push(`${tgt} = Array.isArray(${tgt}) ? [...${tgt}, ${jsValue(a.value)}] : String(${tgt} || '') + ${jsValue(a.value)};`)
            break
          case 'incr':
            lines.push(`${tgt} = Number(${tgt} || 0) + Number(${jsValue(a.value)});`)
            break
          case 'remove':
            lines.push(`${tgt} = null;`)
            break
        }
      })
      // OpenPIM requires marking what changed before save
      // Here we conservatively mark 'values' if any target starts with values.
      const touchValues = arr.some(a => (a.target || '').startsWith('values'))
      const touchRuntime = arr.some(a => (a.target || '').startsWith('runtime'))
      if (touchValues) lines.push('item.changed(\'values\', true)')
      if (touchRuntime) lines.push('item.changed(\'runtime\', true)')
      return lines.join('\n')
    }
    function indent (str, spaces = 2) {
      return str.split('\n').map(l => ' '.repeat(spaces) + l).join('\n')
    }

    const variableOptions = ref<Array<{ label: string, path: string }>>([])
    const targetOptions = ref<Array<{ label: string, path: string }>>([])

    // API
    function create () {
      emit('created', {
        ...triggerRef.value,
        conditionsJoin: conditionsJoin.value
      })
      dialogRef.value = false
    }
    function showDialog () {
      typeRef.value = 0
      triggerRef.value = { type: 0, event: 0, itemType: 0, itemFrom: 0, relation: 0, itemButton: '', askBeforeExec: false, roles: [], conditions: [], actions: [] }
      selectedItemRef.value = null
      dialogRef.value = true
    }
    function closeDialog () { dialogRef.value = false }

    const {
      getActionCategories,
      getActionAttributes
    } = actionsStore.useStore()

    async function loadOptionsForType (itemTypeId) {
      if (!itemTypeId) {
        variableOptions.value = []
        targetOptions.value = []
        return
      }

      // 1) Fetch categories for the selected type
      const categories = await getActionCategories(String(itemTypeId))
      const groups = categories?.list || []
      // 2) Fetch attributes per group (parallel)
      const perGroup = await Promise.all(
        groups.map((g) => getActionAttributes(String(itemTypeId), String(g.id)))
      )
      const allAttrs = perGroup.flat()

      // 3) Map to {label, path} using the attribute name (or id if name missing)
      const seen = new Set()
      const mapped = []
      for (const a of allAttrs) {
        const key = (a?.name || a?.id || '').toString().trim()
        if (!key || seen.has(key)) continue
        seen.add(key)
        mapped.push({ label: key, path: `values.${key}` })
      }

      variableOptions.value = mapped
      targetOptions.value = mapped
    }

    watch(
      () => [typeRef.value, triggerRef.value.itemType, triggerRef.value.itemFrom],
      async ([t, itemType, itemFrom]) => {
        // For Fix (9): wait for Type + Item
        if (t === 9 && itemType && itemFrom) {
          await loadOptionsForType(Number(itemType))
          return
        }
        // For types that still need item context in your UI (1,3,6): load when Type is selected
        if ([1, 3, 6].includes(Number(t)) && itemType) {
          await loadOptionsForType(Number(itemType))
          return
        }
        // Otherwise clear
        variableOptions.value = []
        targetOptions.value = []
      }
    )

    return {
      // state
      dialogRef,
      typeRef,
      triggerRef,
      selectedItemRef,
      typeSelectionDialogRef,
      itemSelectionDialogRef,
      relSelectionDialogRef,
      rolesSelectionDialogRef,
      currentLanguage,
      defaultLanguageIdentifier,

      // computed
      selectedType,
      selectedRelation,
      userRoles,
      createEnabled,
      typeLabel,
      eventLabel,
      previewCode,
      typeSelection,
      variableOptions,
      operatorOptions,
      targetOptions,
      actionKinds,
      conditionsJoin,

      // helpers
      addCondition,
      removeCondition,
      needsRightValue,
      valueInputComponent,
      addAction,
      removeAction,
      needsActionValue,
      actionValueComponent,

      // pickers
      typeSelected,
      itemSelected,
      relationSelected,
      editRoles,
      rolesSelected,

      // api
      create,
      showDialog,
      closeDialog
    }
  }
}
</script>
