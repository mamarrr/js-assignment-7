<script setup lang="ts">
import type { ApiRecord } from '@/types/api'
import type { ColumnConfig } from './helpers'
import { displayValue } from './helpers'

defineProps<{
  title: string
  description?: string
  rows: ApiRecord[]
  columns: ColumnConfig[]
  rowTo?: (row: ApiRecord) => string
  actionLabel?: string
}>()
</script>

<template>
  <section class="hierarchy-card">
    <div class="hierarchy-card-header">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="description" class="hierarchy-muted">{{ description }}</p>
      </div>
      <span class="hierarchy-badge">{{ rows.length }} records</span>
    </div>

    <div v-if="rows.length === 0" class="hierarchy-empty">
      <strong>No records found</strong>
      <p>Add a record or adjust the current filters.</p>
    </div>

    <div v-else class="hierarchy-table-wrap">
      <table>
        <thead>
          <tr>
            <th v-for="column in columns" :key="column.key">{{ column.label }}</th>
            <th v-if="rowTo" class="hierarchy-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="
              String(row.id ?? row.slug ?? row.customerSlug ?? row.unitSlug ?? JSON.stringify(row))
            "
          >
            <td v-for="column in columns" :key="column.key">{{ displayValue(row[column.key]) }}</td>
            <td v-if="rowTo" class="hierarchy-actions">
              <RouterLink :to="rowTo(row)">{{ actionLabel ?? 'Open' }}</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.hierarchy-card {
  display: grid;
  gap: 1rem;
  border: 1px solid #d6dde8;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
}

.hierarchy-card-header {
  display: flex;
  gap: 1rem;
  align-items: start;
  justify-content: space-between;
}

h2 {
  margin: 0;
  font-size: 1.1rem;
}

.hierarchy-muted,
.hierarchy-empty p {
  margin: 0.25rem 0 0;
  color: #5d687a;
}

.hierarchy-badge {
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  background: #e8f1ff;
  color: #1849a9;
  font-weight: 700;
  white-space: nowrap;
}

.hierarchy-empty {
  border: 1px solid #d6dde8;
  border-radius: 8px;
  padding: 1rem;
  background: #f8fafc;
}

.hierarchy-table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid #e4e9f0;
  padding: 0.7rem;
  text-align: left;
  vertical-align: top;
}

th {
  color: #4a5568;
  font-size: 0.85rem;
}

.hierarchy-actions {
  text-align: right;
}
</style>
