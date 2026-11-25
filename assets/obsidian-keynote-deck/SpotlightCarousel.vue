<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

export interface SpotlightItem {
  title: string
  sub: string
  /** Animated luminous SVG under public/anim/ */
  svg?: string
  /** Dark-studio photo under public/images/ */
  photo?: string
  /** Top-left HUD tag text (optional, shown on photo cards) */
  topTag?: string
  /** Top-left dot style: idle | rec | accent */
  topDot?: 'idle' | 'rec' | 'accent'
  /** Bottom warning HUD pill text (optional, shown on photo cards) */
  bottomTag?: string
  /** Bottom pill alignment: left | right | center */
  bottomAlign?: 'left' | 'right' | 'center'
  /** Optional animated CCTV focus-fail reticle box { left, top, width, height } in % */
  reticle?: { left: string; top: string; width: string; height: string }
}

const props = withDefaults(defineProps<{
  items: SpotlightItem[]
  intervalMs?: number
}>(), {
  intervalMs: 2800,
})

const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const animUrl = (file: string) => `${baseUrl}/anim/${file}`
const photoUrl = (file: string) => `${baseUrl}/images/${file}`

const hasPhotos = computed(() => props.items.some((i) => !!i.photo))
const autoIdx = ref(0)
const hoveredIdx = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (hoveredIdx.value === null) {
      autoIdx.value = (autoIdx.value + 1) % props.items.length
    }
  }, props.intervalMs)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

const activeIdx = computed(() =>
  hoveredIdx.value !== null ? hoveredIdx.value : autoIdx.value
)

function pick(idx: number) {
  autoIdx.value = idx
  hoveredIdx.value = idx
}
</script>

<template>
  <div
    class="cc-grid"
    :class="[items.length === 4 ? 'cc-4' : 'cc-3', { 'cc-rich': hasPhotos }]"
    :style="{ '--dur': intervalMs + 'ms' }"
  >
    <div
      v-for="(item, idx) in items"
      :key="item.title"
      class="cc-card"
      :class="{
        'is-active': activeIdx === idx,
        'is-dim': activeIdx !== idx,
        'is-paused': hoveredIdx === idx,
      }"
      @mouseenter="hoveredIdx = idx"
      @mouseleave="hoveredIdx = null"
      @click="pick(idx)"
    >
      <div class="cc-bar">
        <div v-if="activeIdx === idx" :key="activeIdx + '-' + (hoveredIdx !== null)" class="cc-fill" />
      </div>

      <!-- Dark-Studio Scene Photo + Live Frosted HUD -->
      <div v-if="item.photo" class="cc-scene">
        <img class="cc-photo" :src="photoUrl(item.photo)" :alt="item.title" />
        <div class="cc-vignette" />

        <span
          v-if="item.topTag"
          class="hud-pill hud-tl"
          :class="item.topDot === 'rec' ? 'is-rec' : 'is-dark'"
        >
          <i v-if="item.topDot" :class="'dot-' + item.topDot" />
          {{ item.topTag }}
        </span>

        <div
          v-if="item.reticle"
          class="hud-reticle"
          :style="item.reticle"
          aria-hidden="true"
        >
          <span class="rk tl" /><span class="rk tr" /><span class="rk bl" /><span class="rk br" />
        </div>

        <span
          v-if="item.bottomTag"
          class="hud-pill is-warn"
          :class="{
            'hud-bl': !item.bottomAlign || item.bottomAlign === 'left',
            'hud-br': item.bottomAlign === 'right',
            'hud-bc': item.bottomAlign === 'center',
          }"
        >
          {{ item.bottomTag }}
        </span>
      </div>

      <!-- Luminous Line-Art SVG -->
      <div v-else-if="item.svg" class="cc-vis">
        <img class="cc-img" :src="animUrl(item.svg)" :alt="item.title" />
      </div>

      <div class="cc-title">{{ item.title }}</div>
      <div class="cc-sub">{{ item.sub }}</div>
    </div>
  </div>
</template>

<style scoped>
.cc-grid { display: grid; width: 100%; margin-top: 30px; }
.cc-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; max-width: 820px; }
.cc-3.cc-rich { gap: 18px; max-width: 888px; margin-top: 26px; }
.cc-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; max-width: 868px; }
.cc-4.cc-rich { gap: 14px; max-width: 908px; margin-top: 26px; }

.cc-card {
  position: relative; display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 24px 14px 22px; border-radius: 18px;
  background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.07);
  overflow: hidden; cursor: pointer;
  transition: transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s ease, border-color 0.3s ease, background 0.3s ease, box-shadow 0.36s ease;
}
.cc-4 .cc-card { padding: 20px 10px 18px; }
.cc-rich .cc-card { padding: 10px 10px 16px; border-radius: 16px; background: rgba(255, 255, 255, 0.025); }
.cc-card.is-dim { opacity: 0.42; transform: scale(0.975); }
.cc-rich .cc-card.is-dim { opacity: 0.56; transform: scale(0.98); }
.cc-card.is-active {
  opacity: 1; transform: translateY(-7px) scale(1.025);
  border-color: rgba(255, 105, 0, 0.52); background: rgba(255, 105, 0, 0.055);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.72), 0 0 28px rgba(255, 105, 0, 0.14);
}
.cc-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: rgba(255, 255, 255, 0.04); }
.cc-fill { height: 100%; background: linear-gradient(90deg, var(--mi, #ff6900), #ffb067); transform-origin: left; animation: ccProg var(--dur) linear forwards; }
.cc-card.is-paused .cc-fill { animation: none; width: 100%; }
@keyframes ccProg { from { transform: scaleX(0); } to { transform: scaleX(1); } }

.cc-vis { width: 100%; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), filter 0.3s ease; }
.cc-card.is-active .cc-vis { transform: scale(1.08); filter: drop-shadow(0 0 14px rgba(255, 105, 0, 0.25)); }
.cc-img { width: 100%; max-width: 230px; height: 126px; object-fit: contain; display: block; }
.cc-4 .cc-img { height: 106px; }

.cc-title { font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em; transition: color 0.24s ease; }
.cc-4 .cc-title { font-size: 20px; }
.cc-rich .cc-title { margin-top: 12px; font-size: 19px; }
.cc-3.cc-rich .cc-title { font-size: 21px; }
.cc-card.is-active .cc-title { color: #ff8533; }
.cc-sub { margin-top: 6px; font-size: 14px; color: #a1a1aa; }
.cc-rich .cc-sub { margin-top: 4px; font-size: 13px; }
.cc-3.cc-rich .cc-sub { font-size: 13.5px; }

.cc-scene { position: relative; width: 100%; aspect-ratio: 4 / 3; border-radius: 11px; overflow: hidden; background: #0a0a0d; border: 1px solid rgba(255, 255, 255, 0.08); }
.cc-3.cc-rich .cc-scene { aspect-ratio: 16 / 10; }
.cc-photo { width: 100%; height: 100%; object-fit: cover; display: block; filter: brightness(0.68) saturate(0.78); transform: scale(1.01); transition: transform 2.8s cubic-bezier(0.22, 1, 0.36, 1), filter 0.38s ease; }
.cc-card.is-active .cc-photo { filter: brightness(1.02) saturate(1.06); transform: scale(1.07); }
.cc-vignette { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgba(0, 0, 0, 0.36) 0%, rgba(0, 0, 0, 0.02) 42%, rgba(0, 0, 0, 0.54) 100%); }

.hud-pill {
  position: absolute; z-index: 2; display: inline-flex; align-items: center; gap: 5px;
  padding: 2.5px 7px; border-radius: 999px; font-size: 9.5px; font-weight: 600; line-height: 1.3;
  white-space: nowrap; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.cc-3.cc-rich .hud-pill { font-size: 10px; padding: 3px 8px; }
.hud-tl { top: 7px; left: 7px; }
.hud-bl { bottom: 7px; left: 7px; }
.hud-br { bottom: 7px; right: 7px; }
.hud-bc { bottom: 7px; left: 50%; transform: translateX(-50%); }
.hud-pill.is-dark { background: rgba(12, 12, 16, 0.72); border: 1px solid rgba(255, 255, 255, 0.14); color: #e4e4e7; }
.hud-pill.is-rec { background: rgba(12, 12, 16, 0.74); border: 1px solid rgba(239, 68, 68, 0.35); color: #fecaca; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 9px; }
.hud-pill.is-warn { background: rgba(255, 105, 0, 0.88); border: 1px solid rgba(255, 180, 120, 0.55); color: #ffffff; font-weight: 700; box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45); }
.cc-card.is-dim .hud-pill.is-warn { background: rgba(24, 24, 28, 0.78); border-color: rgba(255, 255, 255, 0.16); color: #d4d4d8; box-shadow: none; }

.dot-idle, .dot-rec, .dot-accent { width: 5px; height: 5px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.dot-idle { background: #a1a1aa; }
.dot-rec { background: #ef4444; animation: hudBlink 1.1s ease-in-out infinite; }
.dot-accent { background: #ff8533; animation: hudBlink 1.5s ease-in-out infinite; }
@keyframes hudBlink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }

.hud-reticle { position: absolute; z-index: 2; pointer-events: none; opacity: 0.65; }
.cc-card.is-active .hud-reticle { opacity: 1; animation: reticleHunt 1.8s ease-in-out infinite; }
@keyframes reticleHunt { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.07); } }
.rk { position: absolute; width: 7px; height: 7px; border-color: var(--mi, #ff6900); border-style: solid; }
.rk.tl { top: 0; left: 0; border-width: 1.8px 0 0 1.8px; }
.rk.tr { top: 0; right: 0; border-width: 1.8px 1.8px 0 0; }
.rk.bl { bottom: 0; left: 0; border-width: 0 0 1.8px 1.8px; }
.rk.br { bottom: 0; right: 0; border-width: 0 1.8px 1.8px 0; }
</style>
