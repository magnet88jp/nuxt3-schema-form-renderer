// composables/useSchemaForm.ts
import type { JSONSchema7, JSONSchema7TypeName } from 'json-schema'

export interface FormField {
  key: string
  label: string
  type: JSONSchema7TypeName | undefined
  component: 'UInput' | 'USelect' | 'UNumberInput' | 'UCheckbox' | 'UCalendarPopover' | 'Unsupported'
  enum?: any[]
  required?: boolean
  format?: string
  minLength?: number
  maxLength?: number
  pattern?: string
  minimum?: number
  maximum?: number
  transform?: (value: any) => any
}

export function useSchemaForm(schema: JSONSchema7): FormField[] {
  if (schema.type !== 'object' || typeof schema.properties !== 'object') {
    console.warn('Invalid schema: expected type object with properties')
    return []
  }

  return Object.entries(schema.properties).map(([key, value]) => {
    const field = value as JSONSchema7
    const base: FormField = {
      key,
      label: field.title || key,
      type: typeof field.type === 'string' ? field.type : undefined,
      format: field.format,
      required: schema.required?.includes(key) || false,
      enum: field.enum,
      minLength: field.minLength,
      maxLength: field.maxLength,
      pattern: field.pattern,
      minimum: field.minimum,
      maximum: field.maximum,
      component: 'Unsupported'
    }

    if (base.enum && Array.isArray(base.enum)) {
      base.component = 'USelect'
      base.enum = base.enum.map((val) => ({
        label: String(val),
        value: val
      }))
    } else if (base.format === 'date') {
      base.component = 'UCalendarPopover'
      base.transform = (val: any) => `${val.year}-${String(val.month).padStart(2, '0')}-${String(val.day).padStart(2, '0')}`
    } else if (base.type === 'string') {
      base.component = 'UInput'
    } else if (base.type === 'number' || base.type === 'integer') {
      base.component = 'UNumberInput'
    } else if (base.type === 'boolean') {
      base.component = 'UCheckbox'
    }

    return base
  })
}
