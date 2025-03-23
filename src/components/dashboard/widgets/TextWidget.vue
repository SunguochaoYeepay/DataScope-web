<template>
  <v-card class="h-100">
    <v-card-title class="d-flex align-center py-2 px-4">
      <span class="text-truncate">{{ widget.title }}</span>
      <v-spacer></v-spacer>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            icon="mdi-dots-vertical"
            variant="text"
            size="small"
            v-bind="props"
          ></v-btn>
        </template>
        <v-list>
          <v-list-item
            prepend-icon="mdi-pencil"
            title="编辑"
            @click="$emit('edit')"
          ></v-list-item>
          <v-list-item
            prepend-icon="mdi-delete"
            title="删除"
            @click="$emit('delete')"
            color="error"
          ></v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text
      class="pa-4"
      :class="{
        'text-center': widget.config.align === 'center',
        'text-right': widget.config.align === 'right'
      }"
      v-html="widget.config.content"
    ></v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  widget: {
    id: string;
    title: string;
    config: {
      content: string;
      align?: 'left' | 'center' | 'right';
    };
  };
}>();

const emit = defineEmits<{
  (e: 'edit'): void;
  (e: 'delete'): void;
}>();
</script>

<style scoped>
.h-100 {
  height: 100%;
}
</style>