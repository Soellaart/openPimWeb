/**
 * index.js
 *
 * This file is how your application (or channel registry) knows how to
 * load the UI component(s) for the FTP channel.
 */

function getConfigCompoment () {
  return 'FtpConfigCompoment'
}

/**
 * Optionally define a separate getter for the mapping UI component,
 * if your system is set up to handle a second-level component.
 * e.g. getMappingComponent or getEditorComponent, etc.
 */
function getMappingCompoment () {
  return 'FtpMappingConfigCompoment'
}

/**
 * If your channel supports standard attributes or not. Return null or an
 * array of attribute definitions, depending on your usage.
 */
function getStandardAttributes () {
  return null
}

export default {
  hasSync: true, // This channel supports sync
  hasExecutions: true, // Shows past executions in UI
  hasItemSync: true, // Sync items individually
  canManageAttributes: false,
  getConfigCompoment,
  getMappingCompoment,
  getStandardAttributes
}
