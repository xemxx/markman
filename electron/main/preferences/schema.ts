import { JSONSchemaType } from 'json-schema-typed'

export const schema = {
  autoSave: {
    type: JSONSchemaType.Boolean,
    default: false,
    description: 'General--Automatically save the content being edited.',
  },
  autoSaveDelay: {
    type: JSONSchemaType.Number,
    description:
      'General--The time in ms after a change that the file is saved.',
    minimum: 0,
    default: 1000,
  },
  toggleSidebar: {
    type: JSONSchemaType.Boolean,
    description: 'View Menu--Sidebar status.',
    default: true,
  },
}
