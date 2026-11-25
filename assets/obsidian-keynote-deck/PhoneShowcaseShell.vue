<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface ChainStep {
  id: number
  code: string
  title: string
  sub: string
  domains: string[]
}

const props = withDefaults(defineProps<{
  kicker: string
  headLine1: string
  headLine2: string
  steps: ChainStep[]
  domains: { key: string; label: string }[]
  bezelFile?: string
  intervalMs?: number
}>(), {
  bezelFile: 'iphone-frame.png',
  intervalMs: 3600,
})

const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const bezelUrl = `${baseUrl}/images/${props.bezelFile}`

const autoStepId = ref<number>(props.steps[0]?.id ?? 1)
const hoveredStep = ref<number | null>(null)
const hoveredDomain = ref<string | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (hoveredStep.value === null && hoveredDomain.value === null) {
      const idx = props.steps.findIndex((s) => s.id === autoStepId.value)
      autoStepId.value = props.steps[(idx + 1) % props.steps.length].id
    }
  }, props.intervalMs)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const currentStepId = computed(() => {
  if (hoveredStep.value !== null) return hoveredStep.value
  if (hoveredDomain.value !== null) {
    return props.steps.find((s) => s.domains.includes(hoveredDomain.value!))?.id ?? autoStepId.value
  }
  return autoStepId.value
})

const currentStep = computed(() => props.steps.find((s) => s.id === currentStepId.value) ?? props.steps[0])
const isPaused = computed(() => hoveredStep.value !== null || hoveredDomain.value !== null)

const isStepLit = (step: ChainStep) =>
  hoveredStep.value !== null
    ? hoveredStep.value === step.id
    : hoveredDomain.value !== null
      ? step.domains.includes(hoveredDomain.value)
      : autoStepId.value === step.id

const isDomainLit = (key: string) =>
  hoveredDomain.value !== null ? hoveredDomain.value === key : currentStep.value.domains.includes(key)

function pickStep(id: number) {
  autoStepId.value = id
  hoveredStep.value = id
}
</script>

<template>
  <div class="showcase" :style="{ '--dur': intervalMs + 'ms' }">
    <!-- LEFT: Real Phone Hardware Bezel + Unified Crisp Light/White UI Stage -->
    <div class="phone-col">
      <div class="phone-aura" aria-hidden="true" />
      <div class="iphone-wrap">
        <div class="iphone-screen">
          <div class="ios-status">
            <span class="ios-time">21:45</span>
            <span class="ios-icons" aria-hidden="true">
              <svg viewBox="0 0 16 11" width="13" height="9" fill="currentColor">
                <rect x="0" y="7" width="2.4" height="4" rx="0.8" />
                <rect x="4" y="5" width="2.4" height="6" rx="0.8" />
                <rect x="8" y="2.5" width="2.4" height="8.5" rx="0.8" />
                <rect x="12" y="0" width="2.4" height="11" rx="0.8" />
              </svg>
              <svg viewBox="0 0 22 11" width="18" height="9" fill="none">
                <rect x="0.8" y="0.8" width="17.4" height="9.4" rx="2.6" stroke="currentColor" stroke-width="1.1" />
                <rect x="2.6" y="2.6" width="13.8" height="5.8" rx="1.2" fill="#22c55e" />
                <path d="M19.8 3.6v3.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              </svg>
            </span>
          </div>

          <div class="ios-body">
            <Transition name="scr" mode="out-in">
              <!-- Supply each step's unified #F5F6F8 + white-card UI via scoped slot -->
              <div :key="currentStep.id" class="app-ui">
                <slot name="screen" :step="currentStep" />
              </div>
            </Transition>
          </div>
          <div class="ios-home" />
        </div>
        <img :src="bezelUrl" alt="iPhone" class="iphone-bezel" />
      </div>
    </div>

    <!-- RIGHT: Headline + 2x3 Interactive Stepper + Domain Pills -->
    <div class="ctrl-col">
      <div class="kicker ctrl-k">{{ kicker }}</div>
      <h1 class="ctrl-head mi">{{ headLine1 }}<br />{{ headLine2 }}</h1>

      <div class="step-grid">
        <button
          v-for="step in steps"
          :key="step.id"
          type="button"
          class="st-tile"
          :class="{ 'is-lit': isStepLit(step), 'is-dim': !isStepLit(step), 'is-paused': isPaused }"
          @mouseenter="hoveredStep = step.id"
          @mouseleave="hoveredStep = null"
          @click="pickStep(step.id)"
        >
          <div class="st-prog"><div v-if="currentStep.id === step.id" :key="currentStep.id + '-' + isPaused" class="st-fill" /></div>
          <div class="st-top">
            <span class="st-title">{{ step.title }}</span>
            <span class="st-code">{{ step.code }}</span>
          </div>
          <div class="st-sub">{{ step.sub }}</div>
        </button>
      </div>

      <div class="dom-row">
        <span
          v-for="d in domains"
          :key="d.key"
          class="dom-pill"
          :class="{ 'is-lit': isDomainLit(d.key) }"
          @mouseenter="hoveredDomain = d.key"
          @mouseleave="hoveredDomain = null"
        >
          <i class="dom-dot" />{{ d.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.showcase { width: 100%; max-width: 876px; display: grid; grid-template-columns: 274px 1fr; gap: 48px; align-items: center; text-align: left; }
.phone-col { position: relative; display: flex; align-items: center; justify-content: center; }
.phone-aura { position: absolute; width: 310px; height: 440px; background: radial-gradient(ellipse at center, rgba(255, 105, 0, 0.22) 0%, transparent 68%); pointer-events: none; }
.iphone-wrap { position: relative; width: 246px; height: 509px; flex-shrink: 0; }
.iphone-bezel { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 30; display: block; }
/* Always unified light/white native canvas inside phone to prevent dark/light carousel flicker */
.iphone-screen {
  position: absolute; inset: 6px; border-radius: 36px; overflow: hidden;
  background: #f5f6f8; color: #18181b; display: flex; flex-direction: column; z-index: 10;
}
.ios-status { height: 34px; padding: 11px 18px 0; display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; font-weight: 700; flex-shrink: 0; }
.ios-icons { display: inline-flex; align-items: center; gap: 5px; }
.ios-body { flex: 1; min-height: 0; padding: 4px 11px 16px; display: flex; flex-direction: column; }
.app-ui { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 7px; }
.ios-home { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); width: 78px; height: 3.5px; border-radius: 99px; background: rgba(0, 0, 0, 0.22); z-index: 25; }

.ctrl-col { display: flex; flex-direction: column; align-items: flex-start; }
.ctrl-k { margin-bottom: 10px !important; }
.ctrl-head { font-size: 40px !important; font-weight: 800 !important; line-height: 1.2 !important; letter-spacing: -0.02em; margin: 0 !important; }
.step-grid { width: 100%; margin-top: 28px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.st-tile { position: relative; text-align: left; padding: 15px 13px 14px; border-radius: 14px; background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden; cursor: pointer; transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease, border-color 0.24s ease, background 0.24s ease; }
.st-tile.is-dim { opacity: 0.46; }
.st-tile:hover, .st-tile.is-lit { opacity: 1; transform: translateY(-4px); border-color: rgba(255, 105, 0, 0.58); background: rgba(255, 105, 0, 0.075); box-shadow: 0 12px 26px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 105, 0, 0.14); }
.st-prog { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: rgba(255, 255, 255, 0.04); }
.st-fill { height: 100%; background: linear-gradient(90deg, var(--mi, #ff6900), #ffb067); transform-origin: left; animation: tileProg var(--dur) linear forwards; }
.st-tile.is-paused .st-fill { animation: none; width: 100%; }
@keyframes tileProg { from { transform: scaleX(0); } to { transform: scaleX(1); } }
.st-top { display: flex; align-items: center; gap: 7px; }
.st-title { font-size: 17px; font-weight: 700; color: #ffffff; }
.st-code { margin-left: auto; font-size: 10.5px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: #52525b; }
.st-tile.is-lit .st-code { color: #ff8533; }
.st-sub { margin-top: 6px; font-size: 12.5px; color: #a1a1aa; white-space: nowrap; }

.dom-row { display: flex; gap: 10px; margin-top: 24px; }
.dom-pill { display: inline-flex; align-items: center; gap: 7px; padding: 6px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; color: #71717a; border: 1px solid rgba(255, 255, 255, 0.09); background: rgba(255, 255, 255, 0.02); cursor: pointer; transition: all 0.22s ease; }
.dom-dot { width: 6px; height: 6px; border-radius: 50%; background: #52525b; }
.dom-pill.is-lit, .dom-pill:hover { color: #ffffff; border-color: rgba(255, 105, 0, 0.6); background: rgba(255, 105, 0, 0.1); }
.dom-pill.is-lit .dom-dot, .dom-pill:hover .dom-dot { background: var(--mi, #ff6900); box-shadow: 0 0 8px var(--mi, #ff6900); }

.scr-enter-active { transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1); }
.scr-leave-active { transition: opacity 0.14s ease, transform 0.14s ease; }
.scr-enter-from { opacity: 0; transform: translateY(8px) scale(0.985); }
.scr-leave-to { opacity: 0; transform: translateY(-6px) scale(0.99); }
</style>
