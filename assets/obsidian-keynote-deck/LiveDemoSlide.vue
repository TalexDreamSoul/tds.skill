<script setup lang="ts">
const props = withDefaults(defineProps<{
  kicker?: string
  leadLine?: string
  accentLine?: string
  url: string
  shotFile: string
  qrFile: string
  liveBadge?: string
  qrTitle?: string
  qrSub?: string
  ctaLabel?: string
}>(), {
  kicker: '线上实景演示',
  leadLine: '不是概念，',
  accentLine: '线上已经跑通。',
  liveBadge: '线上运行中',
  qrTitle: '扫码直达线上系统',
  qrSub: '实景演示 · 实时体验',
  ctaLabel: '立即打开演示',
})

const baseUrl = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
const shotUrl = `${baseUrl}/images/${props.shotFile}`
const qrUrl = `${baseUrl}/images/${props.qrFile}`
const shortHost = props.url.replace(/^https?:\/\//, '').replace(/\/$/, '')
</script>

<template>
  <div class="ld-wrap">
    <a class="ld-browser-col ld-pdf-link" :href="url" target="_blank" rel="noopener noreferrer">
      <div class="ld-aura" aria-hidden="true" />
      <div class="ld-browser">
        <div class="ld-chrome">
          <div class="ld-dots" aria-hidden="true"><i class="d-r" /><i class="d-y" /><i class="d-g" /></div>
          <div class="ld-urlbar">
            <svg viewBox="0 0 14 14" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2.5" y="6" width="9" height="6.5" rx="1.5" />
              <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" />
            </svg>
            <span>{{ url }}</span>
          </div>
          <span class="ld-live"><i /> {{ liveBadge }}</span>
        </div>
        <div class="ld-viewport">
          <img :src="shotUrl" alt="Live System Preview" class="ld-shot" />
          <div class="ld-hover-cue">点击打开线上系统 ↗</div>
        </div>
      </div>
    </a>

    <div class="ld-info">
      <div class="kicker ld-k">{{ kicker }}</div>
      <h1 class="ld-head metal">{{ leadLine }}<br /><span class="mi">{{ accentLine }}</span></h1>

      <div class="ld-qr-card">
        <div class="ld-qr-box"><img :src="qrUrl" :alt="url" class="ld-qr-img" /></div>
        <div class="ld-qr-meta">
          <div class="ld-qr-t">{{ qrTitle }}</div>
          <div class="ld-qr-u">{{ shortHost }}</div>
          <div class="ld-qr-s">{{ qrSub }}</div>
        </div>
      </div>

      <a class="ld-cta ld-pdf-link" :href="url" target="_blank" rel="noopener noreferrer">
        <span>{{ ctaLabel }}</span>
        <span class="ld-cta-url">{{ url }}</span>
        <span class="ld-cta-arr">↗</span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.ld-wrap { width: 100%; max-width: 896px; display: grid; grid-template-columns: 1.46fr 1fr; gap: 36px; align-items: center; text-align: left; }
.ld-browser-col { position: relative; display: block; text-decoration: none !important; border-bottom: none !important; cursor: pointer; }
.ld-aura { position: absolute; inset: -14px; background: radial-gradient(ellipse at center, rgba(255, 105, 0, 0.22) 0%, transparent 68%); pointer-events: none; }
.ld-browser { position: relative; z-index: 1; border-radius: 14px; overflow: hidden; background: #121216; border: 1px solid rgba(255, 255, 255, 0.14); box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 105, 0, 0.12); transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.28s ease; }
.ld-browser-col:hover .ld-browser { transform: translateY(-4px) scale(1.012); border-color: rgba(255, 105, 0, 0.58); }
.ld-chrome { display: flex; align-items: center; gap: 10px; padding: 9px 12px; background: #19191f; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.ld-dots { display: flex; gap: 5px; }
.ld-dots i { width: 8px; height: 8px; border-radius: 50%; display: block; }
.d-r { background: #ff5f57; } .d-y { background: #febc2e; } .d-g { background: #28c840; }
.ld-urlbar { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 3.5px 10px; border-radius: 6px; background: rgba(0, 0, 0, 0.45); border: 1px solid rgba(255, 255, 255, 0.07); color: #d4d4d8; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 10.5px; }
.ld-urlbar svg { color: #22c55e; flex-shrink: 0; }
.ld-live { display: inline-flex; align-items: center; gap: 5px; padding: 2.5px 8px; border-radius: 999px; background: rgba(34, 197, 94, 0.14); border: 1px solid rgba(34, 197, 94, 0.35); color: #4ade80; font-size: 9.5px; font-weight: 700; }
.ld-live i { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; animation: ldPulse 1.5s ease-in-out infinite; }
@keyframes ldPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
.ld-viewport { position: relative; width: 100%; aspect-ratio: 16 / 10.4; overflow: hidden; background: #09090b; }
.ld-shot { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
.ld-hover-cue { position: absolute; right: 12px; bottom: 12px; padding: 5px 11px; border-radius: 999px; background: rgba(10, 10, 14, 0.78); border: 1px solid rgba(255, 105, 0, 0.5); backdrop-filter: blur(8px); color: #ffffff; font-size: 11px; font-weight: 600; }
.ld-info { display: flex; flex-direction: column; align-items: flex-start; }
.ld-k { margin-bottom: 10px !important; }
.ld-head { font-size: 38px !important; font-weight: 800 !important; line-height: 1.22 !important; letter-spacing: -0.02em; margin: 0 !important; }
.ld-qr-card { width: 100%; margin-top: 24px; padding: 12px 14px; border-radius: 14px; background: rgba(255, 255, 255, 0.035); border: 1px solid rgba(255, 255, 255, 0.1); display: flex; align-items: center; gap: 14px; }
.ld-qr-box { width: 82px; height: 82px; padding: 5px; border-radius: 10px; background: #ffffff; flex-shrink: 0; }
.ld-qr-img { width: 100%; height: 100%; display: block; }
.ld-qr-t { font-size: 14px; font-weight: 700; color: #ffffff; }
.ld-qr-u { margin-top: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; font-weight: 600; color: #ff8533; }
.ld-qr-s { margin-top: 6px; font-size: 11px; color: #a1a1aa; white-space: nowrap; }
.ld-cta { width: 100%; margin-top: 16px; padding: 12px 16px; border-radius: 999px; background: linear-gradient(90deg, var(--mi, #ff6900), #ff8533); color: #ffffff !important; text-decoration: none !important; border: none !important; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 13px; font-weight: 700; box-shadow: 0 10px 26px rgba(255, 105, 0, 0.34); transition: transform 0.24s ease, box-shadow 0.24s ease; }
.ld-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(255, 105, 0, 0.48); }
.ld-cta-url { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 999px; background: rgba(0, 0, 0, 0.2); }
</style>
