<script setup lang="ts">
import { ref } from 'vue'
import SchemaFormRenderer from '~/components/SchemaFormRenderer.vue'

const schemaText = ref(`{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "title": "名前"
    },
    "age": {
      "type": "number",
      "title": "年齢"
    },
    "gender": {
      "type": "string",
      "title": "性別",
      "enum": ["男性", "女性", "その他"]
    },
    "isAdmin": {
      "type": "boolean",
      "title": "管理者"
    }
  },
  "required": ["name", "gender"]
}`)

const formData = ref({})

function handleSubmit(data: Record<string, any>) {
  console.log('フォーム送信:', data)
}
</script>

<template>
  <div class="p-6 space-y-6">
    <UCard>
      <template #header>JSON Schema 入力</template>
      <UTextarea v-model="schemaText" class="w-full" rows="12" />
    </UCard>

    <UCard>
      <template #header>フォーム表示</template>
      <SchemaFormRenderer
        v-model="formData"
        :schema="schemaText"
        submit-label="登録"
        debug
        @submit="handleSubmit"
      />
    </UCard>
  </div>
</template>