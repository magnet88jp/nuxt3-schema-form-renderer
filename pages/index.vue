<script setup lang="ts">
import { ref } from 'vue'
import SchemaFormRenderer from '~/components/SchemaFormRenderer.vue'

const schemaText = ref(`{
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "title": "ユーザー名",
      "minLength": 3,
      "maxLength": 15,
      "pattern": "^[a-zA-Z0-9_]+$"
    },
    "email": {
      "type": "string",
      "title": "メールアドレス",
      "format": "email"
    },
    "gender": {
      "type": "string",
      "title": "性別",
      "enum": ["男性", "女性", "その他"]
    },
    "birthDate": {
      "type": "string",
      "title": "誕生日",
      "format": "date"
    },
    "age": {
      "type": "number",
      "title": "年齢",
      "minimum": 18,
      "maximum": 100
    },
    "isSubscribed": {
      "type": "boolean",
      "title": "ニュースレター購読"
    }
  },
  "required": ["username", "email", "birthDate", "age"]
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
      <UTextarea v-model="schemaText" class="w-full" :rows="12" />
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