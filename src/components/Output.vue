<template>
    <div class="mb-2">
        <template v-if="type === 'error'">
            <div class="text-red-400">
                {{ output }}
            </div>
        </template>
        <template v-else-if="type === 'output'">
            <div class="text-green-400">
                <code>{{ output ?? 'No Errors' }}</code>
            </div>
        </template>
        <template v-else>
            <div class="text-blue-400">
                {{ output }}
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps({
    type: String,
    output: String,
});

</script>