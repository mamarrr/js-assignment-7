<script setup lang="ts">
import type { ApiRecord } from '@/types/api'
import { asArray, asRecord, displayValue } from './helpers'

const props = defineProps<{
  title: string
  subtitle?: string
  dashboard: ApiRecord
  links?: { label: string; to: string }[]
}>()

const metricGroups = () =>
  Object.entries(props.dashboard).filter(([, value]) => {
    const list = asArray(value)
    return list.length > 0 && list.every((item) => 'label' in asRecord(item) && 'value' in asRecord(item))
  })

const listGroups = () =>
  Object.entries(props.dashboard).filter(([, value]) => {
    const list = asArray(value)
    return list.length > 0 && !list.every((item) => 'label' in asRecord(item) && 'value' in asRecord(item))
  })
</script>

<template>
  <div class="dashboard-grid">
    <section class="dashboard-hero">
      <div>
        <p class="eyebrow">Dashboard</p>
        <h1>{{ title }}</h1>
        <p v-if="subtitle" class="muted">{{ subtitle }}</p>
      </div>
      <nav v-if="links?.length" class="hero-actions" aria-label="Context actions">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to">{{ link.label }}</RouterLink>
      </nav>
    </section>

    <section v-for="[name, metrics] in metricGroups()" :key="name" class="card">
      <h2>{{ name }}</h2>
      <div class="metrics">
        <div v-for="metric in asArray(metrics)" :key="String(asRecord(metric).label)" class="metric">
          <span>{{ displayValue(asRecord(metric).label) }}</span>
          <strong>{{ displayValue(asRecord(metric).value) }}</strong>
        </div>
      </div>
    </section>

    <section v-for="[name, rows] in listGroups()" :key="name" class="card">
      <h2>{{ name }}</h2>
      <div class="list">
        <article v-for="row in asArray(rows).slice(0, 6)" :key="JSON.stringify(row)" class="list-row">
          <strong>{{ displayValue(asRecord(row).title ?? asRecord(row).name ?? asRecord(row).label) }}</strong>
          <span>{{ displayValue(asRecord(row).supportingText ?? asRecord(row).statusLabel ?? asRecord(row).createdAt) }}</span>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  gap: 1rem;
}

.dashboard-hero,
.card {
  border: 1px solid #d6dde8;
  border-radius: 8px;
  padding: 1rem;
  background: #fff;
}

.dashboard-hero {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.eyebrow {
  margin: 0 0 0.25rem;
  color: #155eef;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
}

h1,
h2 {
  margin: 0;
}

h1 {
  font-size: 1.4rem;
}

h2 {
  margin-bottom: 0.75rem;
  font-size: 1.05rem;
}

.muted,
.list-row span,
.metric span {
  color: #5d687a;
}

.hero-actions,
.metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero-actions a {
  border: 1px solid #b9c3d0;
  border-radius: 6px;
  padding: 0.55rem 0.75rem;
  text-decoration: none;
}

.metric {
  min-width: 9rem;
  border: 1px solid #e4e9f0;
  border-radius: 8px;
  padding: 0.75rem;
}

.metric strong {
  display: block;
  margin-top: 0.25rem;
  font-size: 1.3rem;
}

.list {
  display: grid;
  gap: 0.6rem;
}

.list-row {
  display: grid;
  gap: 0.15rem;
  border-bottom: 1px solid #e4e9f0;
  padding-bottom: 0.6rem;
}
</style>

