<script setup lang="ts">
import { reactive, ref } from 'vue'
import { LinktorChat, type LinktorMessage } from '@linktor/vue-webchat'

const LS_KEY = 'linktor-demo'

const saved = (() => {
  try {
    return { channelId: '', baseUrl: 'https://api.linktor.dev', token: '', ...JSON.parse(localStorage.getItem(LS_KEY) || '{}') }
  } catch {
    return { channelId: '', baseUrl: 'https://api.linktor.dev', token: '' }
  }
})()

const form = reactive({ channelId: saved.channelId, baseUrl: saved.baseUrl, token: saved.token, themed: false })
const mounted = ref(false)
const remountKey = ref(0)
const log = ref<string[]>([])

function push(line: string) {
  log.value = [`${new Date().toLocaleTimeString()}  ${line}`, ...log.value].slice(0, 50)
}

function mount() {
  if (!form.channelId.trim() || !form.baseUrl.trim()) return
  localStorage.setItem(LS_KEY, JSON.stringify({ channelId: form.channelId, baseUrl: form.baseUrl, token: form.token }))
  log.value = []
  mounted.value = false
  // bump key to force a fresh mount when re-clicking with new values
  remountKey.value++
  requestAnimationFrame(() => (mounted.value = true))
}
</script>

<template>
  <div class="page">
    <div class="card">
      <h1>Linktor WebChat — demo Vue</h1>
      <p class="sub">
        Consome o pacote publicado <code>@linktor/vue-webchat</code>. Informe um canal WebChat e a
        origem da API para testar o canal ao vivo.
      </p>

      <label>Channel ID</label>
      <input v-model="form.channelId" placeholder="uuid do canal WebChat" />

      <label>Base URL (origem da API, sem /api/v1)</label>
      <input v-model="form.baseUrl" placeholder="https://api.linktor.dev" />

      <label>Token (opcional — canais com widget_secret)</label>
      <input v-model="form.token" placeholder="deixe vazio se não usar" />

      <label class="checkbox">
        <input type="checkbox" v-model="form.themed" />
        Aplicar tema customizado (roxo, cantos arredondados, sem "Powered by")
      </label>

      <button :disabled="!form.channelId.trim() || !form.baseUrl.trim()" @click="mount">
        {{ mounted ? 'Remontar widget' : 'Montar widget' }}
      </button>

      <p v-if="mounted" class="hint">
        Widget montado no canto inferior direito. Abra-o e envie uma mensagem — os eventos aparecem abaixo.
      </p>

      <template v-if="log.length">
        <label>Eventos</label>
        <pre class="log">{{ log.join('\n') }}</pre>
      </template>
    </div>

    <LinktorChat
      v-if="mounted"
      :key="remountKey"
      :channel-id="form.channelId"
      :base-url="form.baseUrl"
      :token="form.token || undefined"
      :auto-open="true"
      :theme="form.themed ? { primaryColor: '#7c3aed', borderRadius: '16px', headerBg: '#4c1d95' } : undefined"
      :labels="form.themed ? { title: 'Demo Linktor', poweredBy: false } : undefined"
      @ready="push('ready — widget montado')"
      @open="push('open')"
      @close="push('close')"
      @message="(m: LinktorMessage) => push(`message [${m.sender_type}] ${m.content ?? '(anexo)'}`)"
    />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #f3f4f6; display: flex; justify-content: center; align-items: flex-start; padding: 3rem 1rem; font-family: system-ui, sans-serif; color: #111827; }
.card { width: 100%; max-width: 520px; background: #fff; border-radius: 16px; padding: 2rem; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
h1 { font-size: 22px; margin: 0 0 .25rem; }
.sub { font-size: 14px; color: #6b7280; line-height: 1.5; margin-top: 0; }
label { display: block; font-size: 13px; font-weight: 600; margin: 1rem 0 .35rem; }
input:not([type='checkbox']) { width: 100%; box-sizing: border-box; padding: .6rem .75rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
.checkbox { display: flex; gap: .5rem; align-items: center; font-size: 13px; margin: 1rem 0; cursor: pointer; }
button { width: 100%; padding: .7rem; border: none; border-radius: 8px; background: #4f46e5; color: #fff; font-size: 15px; font-weight: 600; cursor: pointer; margin-top: .5rem; }
button:disabled { opacity: .5; cursor: not-allowed; }
.hint { font-size: 13px; color: #059669; margin-top: 1rem; }
.log { background: #0b1020; color: #d1d5db; padding: .75rem; border-radius: 8px; font-size: 12px; max-height: 200px; overflow-y: auto; white-space: pre-wrap; }
</style>
