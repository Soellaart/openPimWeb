import { reactive, provide, inject } from '@vue/composition-api'
import { serverFetch, objectToGraphgl } from './utils'

const roles = reactive([])

let promise
const actions = {
  loadAllRoles: async () => {
    if (!promise) promise = serverFetch('query { getRoles {id, internalId, identifier, name, configAccess, relAccess, itemAccess, channelAccess, otherAccess, options, updatedAt, updatedBy, createdAt, createdBy } }')
    const data = await promise
    if (roles.length > 0) return
    if (data && data.getRoles) {
      if (roles.length > 0) return
      data.getRoles.forEach(element => {
        roles.push(element)
      })
    } else {
      promise = null
    }
  },
  addRole: () => {
    const newRole = {
      id: Date.now(),
      internalId: 0,
      name: '',
      configAccess: { types: 0, attributes: 0, relations: 0, users: 0, roles: 0, languages: 0, lovs: 0, actions: 0, dashboards: 0, channels: 0 },
      relAccess: { relations: [], access: 0, groups: [] },
      itemAccess: { valid: [], fromItems: [], access: 0, groups: [] },
      channelAccess: [],
      otherAccess: { audit: false, search: false, exportCSV: false, exportXLS: false, importXLS: false },
      options: []
    }
    roles.push(newRole)
    return newRole
  },
  saveRole: async (role) => {
    if (role.internalId === 0) {
      const query = `
        mutation { createRole(identifier: "` + role.identifier + '", name: "' + role.name +
        '", configAccess: ' + objectToGraphgl(role.configAccess) +
        ', relAccess: ' + objectToGraphgl(role.relAccess) +
        ', itemAccess: ' + objectToGraphgl(role.itemAccess) +
        ', channelAccess: ' + objectToGraphgl(role.channelAccess) +
        ', otherAccess: ' + objectToGraphgl(role.otherAccess) +
        ', options: ' + objectToGraphgl(role.options) + ` )
      }`
      const data = await serverFetch(query)
      const newId = parseInt(data.createRole)
      role.internalId = newId
    } else {
      const query = `
        mutation { updateRole(id: "` + role.internalId + '", name: "' + role.name +
        '", configAccess: ' + (role.configAccess ? objectToGraphgl(role.configAccess) : '') +
        ', relAccess: ' + objectToGraphgl(role.relAccess) +
        ', itemAccess: ' + objectToGraphgl(role.itemAccess) +
        ', channelAccess: ' + objectToGraphgl(role.channelAccess) +
        ', otherAccess: ' + objectToGraphgl(role.otherAccess) +
        ', options: ' + objectToGraphgl(role.options) + ` )
      }`
      await serverFetch(query)
    }
  },
  removeRole: async (id) => {
    const idx = roles.findIndex((elem) => elem.id === id)

    if (roles[idx].internalId !== 0) {
      const query = `
        mutation { removeRole(id: "` + roles[idx].internalId + `")
      }`
      await serverFetch(query)
    }
    roles.splice(idx, 1)
  }
}

const store = {
  roles: roles,
  ...actions
}

export { store }

const StoreSymbol = Symbol('RolesStore')

export function provideStore () {
  provide(StoreSymbol, store)
}

export function useStore () {
  const tst = inject(StoreSymbol)
  if (!tst) {
    console.error('Failed to inject RolesStore')
  }
  return tst
}
