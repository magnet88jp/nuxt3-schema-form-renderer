<!-- components/SchemaFormRenderer.vue - JSON Schema Draft 7 対応 -->

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSchemaForm } from '~/composables/useSchemaForm'
import type { JSONSchema7 } from 'json-schema'

const props = defineProps<{
  schema: string | JSONSchema7
  modelValue: Record<string, any>
  debug?: boolean
  submitLabel?: string
}>()

const emit = defineEmits(['update:modelValue', 'submit'])

const localData = ref<Record<string, any>>({ ...props.modelValue })
const error = ref<string>('')
const parsedSchema = ref<JSONSchema7 | null>(null)

watch(() => props.modelValue, (val) => {
  localData.value = { ...val }
}, { deep: true })

watch(() => localData.value, (val) => {
  emit('update:modelValue', val)
}, { deep: true })

try {
  parsedSchema.value = typeof props.schema === 'string' ? JSON.parse(props.schema) : props.schema
  if (parsedSchema.value.type !== 'object' || !parsedSchema.value.properties) {
    throw new Error('Invalid JSON Schema: type must be object with properties')
  }
} catch (e) {
  error.value = 'JSON Schema parse error: ' + (e as Error).message
}

const fields = computed(() => {
  if (!parsedSchema.value) return []
  return useSchemaForm(parsedSchema.value)
})

const validateField = (field: any, value: any) => {
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label} は必須です`
  }
  if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
    return `${field.label} は ${field.minLength}文字以上で入力してください`
  }
  if (field.pattern && typeof value === 'string') {
    const regex = new RegExp(field.pattern)
    if (!regex.test(value)) {
      return `${field.label} の形式が正しくありません`
    }
  }
  if (field.format === 'email' && typeof value === 'string') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return `${field.label} は有効なメールアドレスを入力してください`
    }
  }
  return ''
}

const validate = () => {
  const errors: Record<string, string> = {}
  for (const field of fields.value) {
    const err = validateField(field, localData.value[field.key])
    if (err) errors[field.key] = err
  }
  return Object.keys(errors).length === 0 ? null : errors
}

function onSubmit() {
  const errors = validate()
  if (errors) {
    error.value = Object.values(errors).join('\n')
    return
  }
  error.value = ''
  emit('submit', localData.value)
}
</script>

<template>
  <div>
    <UForm :state="localData" @submit.prevent="onSubmit">
      <div v-for="field in fields" :key="field.key" class="space-y-2">
        <label class="font-bold">{{ field.label }} <span v-if="field.required" class="text-red-500">*</span></label>

        <UInput
          v-if="field.component === 'UInput'"
          v-model="localData[field.key]"
          :placeholder="field.label"
        />

        <USelect
          v-else-if="field.component === 'USelect'"
          v-model="localData[field.key]"
          :items="field.enum"
        />

        <UInput
          v-else-if="field.component === 'UNumberInput'"
          type="number"
          v-model="localData[field.key]"
        />

        <UCheckbox
          v-else-if="field.component === 'UCheckbox'"
          v-model="localData[field.key]"
        />

        <div v-else class="text-gray-500 italic">未対応の型: {{ field.type }}</div>
      </div>

      <UButton type="submit" class="mt-4">{{ submitLabel || '送信' }}</UButton>
    </UForm>

    <pre v-if="debug" class="mt-4 bg-gray-100 p-2 text-sm">{{ localData }}</pre>
    <div v-if="error" class="text-red-500 mt-2 whitespace-pre-line">{{ error }}</div>
  </div>
</template>

<style scoped>
label {
  display: block;
}
</style>
