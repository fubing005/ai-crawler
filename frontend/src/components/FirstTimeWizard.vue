<template>
  <div class="wizard">
    <header class="wizard__header">
      <h1 class="wizard__title">5 步带您完成首次爬取</h1>
      <p class="wizard__subtitle">
        正在准备第 {{ currentStep }} 步：{{ stepName }}（步骤 {{ currentStep }}/5）
      </p>
      <n-steps
        :current="currentStep"
        :status="stepStatus"
        size="small"
        class="wizard__steps"
        :options="stepOptions"
      />
      <n-button
        v-if="currentStep > 0"
        text
        tertiary
        class="wizard__skip"
        @click="onSkip"
        aria-label="跳过向导"
      >跳过向导</n-button>
    </header>

    <main class="wizard__body">
      <!-- Step 1: 欢迎 -->
      <section v-if="currentStep === 1" class="wizard__step" aria-label="欢迎页">
        <h2 class="wizard__step-title">选择一个示例开始尝试</h2>
        <p class="wizard__step-desc">悬停或键盘 Tab 浏览即可查看每个示例。</p>
        <div class="wizard__examples">
          <article
            v-for="example in examples"
            :key="example.id"
            class="wizard__example"
            :class="{ 'wizard__example--active': selectedExample === example.id }"
            tabindex="0"
            role="button"
            :aria-label="example.title"
            @click="selectedExample = example.id"
            @keydown.enter="selectedExample = example.id"
          >
            <div class="wizard__example-emoji">{{ example.emoji }}</div>
            <div class="wizard__example-title">{{ example.title }}</div>
            <div class="wizard__example-desc">{{ example.desc }}</div>
          </article>
        </div>
      </section>

      <!-- Step 2: AI 模型 -->
      <section v-else-if="currentStep === 2" class="wizard__step" aria-label="选择 AI 助手">
        <h2 class="wizard__step-title">选择 AI 助手</h2>
        <p class="wizard__step-desc">用于分析网页结构与识别字段。</p>
        <div class="wizard__providers">
          <article
            class="wizard__provider"
            :class="{ 'wizard__provider--active': aiProvider === 'ollama' }"
            tabindex="0"
            role="button"
            @click="aiProvider = 'ollama'"
            @keydown.enter="aiProvider = 'ollama'"
          >
            <div class="wizard__provider-name">本地 Ollama</div>
            <div class="wizard__provider-endpoint">http://localhost:11434</div>
            <div class="wizard__provider-tag">无需联网 · 数据不离开本机</div>
          </article>
          <article
            class="wizard__provider"
            :class="{ 'wizard__provider--active': aiProvider === 'cloud' }"
            tabindex="0"
            role="button"
            @click="aiProvider = 'cloud'"
            @keydown.enter="aiProvider = 'cloud'"
          >
            <div class="wizard__provider-name">云端提供商</div>
            <div class="wizard__provider-endpoint">OpenAI / Anthropic / 其他</div>
            <div class="wizard__provider-tag">速度更快 · 学术研究场景适用</div>
          </article>
        </div>
        <div class="wizard__test">
          <n-button
            tertiary
            :loading="testing"
            :disabled="!aiProvider"
            @click="onTestProvider"
          >测试连接</n-button>
          <span v-if="testResult === 'ok'" class="wizard__test-result wizard__test-result--ok">✓ 已连通</span>
          <span v-else-if="testResult === 'fail'" class="wizard__test-result wizard__test-result--fail">连接失败，请检查设置</span>
          <span v-else-if="testResult === 'timeout'" class="wizard__test-result wizard__test-result--fail">3 秒内未响应（已超时）</span>
        </div>
      </section>

      <!-- Step 3: 网址来源 -->
      <section v-else-if="currentStep === 3" class="wizard__step" aria-label="粘贴网址">
        <h2 class="wizard__step-title">粘贴网址</h2>
        <p class="wizard__step-desc">选择示例或自定义输入。</p>
        <div class="wizard__url-grid">
          <article
            v-for="card in urlCards"
            :key="card.url"
            class="wizard__url-card"
            :class="{ 'wizard__url-card--active': sourceUrl === card.url }"
            tabindex="0"
            role="button"
            @click="onPickUrl(card.url)"
            @keydown.enter="onPickUrl(card.url)"
          >
            <div class="wizard__url-card-title">{{ card.title }}</div>
            <div class="wizard__url-card-url">{{ card.url }}</div>
          </article>
        </div>
        <n-input
          v-model:value="customUrl"
          placeholder="或粘贴自定义网址（http:// 或 https:// 开头）"
          size="large"
          :input-props="{ 'aria-label': '自定义网址' }"
          :status="customUrlError ? 'error' : undefined"
          @blur="validateCustomUrl"
        />
        <p v-if="customUrlError" class="wizard__error">网址格式不正确，请检查后重试。</p>
      </section>

      <!-- Step 4: AI 分析预览 -->
      <section v-else-if="currentStep === 4" class="wizard__step" aria-label="选择字段">
        <h2 class="wizard__step-title">AI 已识别以下字段</h2>
        <p class="wizard__step-desc">勾选您需要的字段，置信度越高越可靠。</p>
        <n-spin v-if="analyzing" size="large" />
        <div v-else class="wizard__fields">
          <label
            v-for="field in analyzeResult?.fields ?? []"
            :key="field.name"
            class="wizard__field"
          >
            <n-checkbox
              v-model:checked="fieldChecked[field.name]"
              @update:checked="onFieldToggle(field.name, $event)"
            />
            <div class="wizard__field-info">
              <div class="wizard__field-name">{{ field.name }}</div>
              <div class="wizard__field-meta">
                置信度 {{ Math.round(field.confidence * 100) }}% · 示例：{{ field.sample }}
              </div>
            </div>
          </label>
        </div>
        <n-empty v-if="!analyzing && (!analyzeResult?.fields?.length)" description="没有识别到字段，可点击重新分析。" />
      </section>

      <!-- Step 5: 确认并开始 -->
      <section v-else-if="currentStep === 5" class="wizard__step" aria-label="确认并开始">
        <h2 class="wizard__step-title">准备就绪</h2>
        <p class="wizard__step-desc">核对以下配置后即可开始首次爬取。</p>
        <dl class="wizard__summary">
          <div><dt>AI 助手</dt><dd>{{ aiProvider === 'ollama' ? '本地 Ollama' : '云端提供商' }}</dd></div>
          <div><dt>起始网址</dt><dd>{{ sourceUrl || customUrl || '—' }}</dd></div>
          <div><dt>已选字段</dt><dd>{{ selectedFields.length ? selectedFields.join(', ') : '未选择任何字段' }}</dd></div>
        </dl>
      </section>
    </main>

    <footer class="wizard__footer">
      <n-button tertiary :disabled="currentStep <= 1" @click="onPrev">上一步</n-button>
      <n-button
        v-if="currentStep < 5"
        type="primary"
        :disabled="!canNext"
        @click="onNext"
      >下一步</n-button>
      <n-button
        v-else
        type="primary"
        :loading="crawling"
        @click="onFinish"
      >完成并开始爬取</n-button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  NSteps, NButton, NInput, NCheckbox, NSpin, NEmpty
} from 'naive-ui';
import { useOnboardingStore } from '@/stores/onboarding';
import { analyze, crawl, testAiProvider } from '@/api/analyze';
import type { AnalyzeResponse } from '@/types/analyze';
import confetti from 'canvas-confetti';

const router = useRouter();
const onboarding = useOnboardingStore();

const currentStep = ref(1);
const aiProvider = ref<'ollama' | 'cloud' | null>(null);
const testing = ref(false);
const testResult = ref<'idle' | 'ok' | 'fail' | 'timeout'>('idle');
const sourceUrl = ref<string | null>(null);
const customUrl = ref('');
const customUrlError = ref(false);
const analyzeResult = ref<AnalyzeResponse | null>(null);
const analyzing = ref(false);
const selectedFields = ref<string[]>([]);
const fieldChecked = ref<Record<string, boolean>>({});
const crawling = ref(false);
const selectedExample = ref<string | null>(null);

const examples = [
  { id: 'ecommerce', emoji: '🛒', title: '电商商品', desc: '商品名、价格、图片' },
  { id: 'news', emoji: '📰', title: '新闻文章', desc: '标题、作者、发布时间' },
  { id: 'blog', emoji: '📝', title: '博客正文', desc: '标题、正文、标签' }
];

const urlCards = [
  { title: '示例商品页', url: 'https://example.com/product' },
  { title: '示例新闻页', url: 'https://example.com/news' },
  { title: '示例博客页', url: 'https://example.com/blog' }
];

const stepOptions = [
  { title: '欢迎', description: '选择示例' },
  { title: 'AI 助手', description: '选择模型' },
  { title: '粘贴网址', description: '输入爬取入口' },
  { title: '字段预览', description: '勾选需要的字段' },
  { title: '完成', description: '开始首次爬取' }
];

const stepName = computed(() => stepOptions[currentStep.value - 1]?.title ?? '');
const stepStatus = computed<'process' | 'finish' | 'error'>(() => 'process');

const canNext = computed(() => {
  if (currentStep.value === 1) return true;
  if (currentStep.value === 2) return aiProvider.value !== null;
  if (currentStep.value === 3) return Boolean(sourceUrl.value || (customUrl.value && !customUrlError.value));
  if (currentStep.value === 4) return selectedFields.value.length > 0;
  if (currentStep.value === 5) return true;
  return false;
});

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown);
  await onboarding.loadInitial();
  if (onboarding.currentStep) currentStep.value = onboarding.currentStep;
  if (onboarding.aiProvider) aiProvider.value = onboarding.aiProvider;
  if (onboarding.sourceUrl) {
    sourceUrl.value = onboarding.sourceUrl;
    if (!urlCards.some((c) => c.url === onboarding.sourceUrl)) {
      customUrl.value = onboarding.sourceUrl;
    }
  }
  if (onboarding.selectedFields?.length) {
    selectedFields.value = [...onboarding.selectedFields];
    for (const f of selectedFields.value) fieldChecked.value[f] = true;
  }
  if (onboarding.wizardVariant === 'detailed') {
    // 详细配置路径：保留入口，不改变 5 步结构
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

function onPrev() {
  if (currentStep.value > 1) {
    currentStep.value--;
    onboarding.setCurrentStep(currentStep.value);
  }
}

async function onNext() {
  if (!canNext.value) return;
  if (currentStep.value === 3) {
    const url = sourceUrl.value || customUrl.value;
    if (!url) return;
    onboarding.setSourceUrl(url);
    await analyzeCurrent(url);
  } else if (currentStep.value === 2) {
    if (aiProvider.value) onboarding.setAiProvider(aiProvider.value);
  }
  currentStep.value++;
  onboarding.setCurrentStep(currentStep.value);
}

async function onTestProvider() {
  if (!aiProvider.value) return;
  testing.value = true;
  testResult.value = 'idle';
  const endpoint = aiProvider.value === 'ollama' ? 'http://localhost:11434' : 'https://api.openai.com';
  try {
    const ok = await testAiProvider(endpoint);
    testResult.value = ok ? 'ok' : 'fail';
  } catch {
    testResult.value = 'timeout';
  } finally {
    testing.value = false;
  }
}

function onPickUrl(url: string) {
  sourceUrl.value = url;
  customUrl.value = '';
  customUrlError.value = false;
}

function validateCustomUrl() {
  if (!customUrl.value) {
    customUrlError.value = false;
    sourceUrl.value = null;
    return;
  }
  try {
    new URL(customUrl.value);
    customUrlError.value = false;
    sourceUrl.value = customUrl.value;
  } catch {
    customUrlError.value = true;
    sourceUrl.value = null;
  }
}

async function analyzeCurrent(url: string) {
  analyzing.value = true;
  analyzeResult.value = null;
  try {
    const result = await analyze(url);
    analyzeResult.value = result;
    selectedFields.value = result.fields.map((f) => f.name);
    for (const f of result.fields) fieldChecked.value[f.name] = true;
    onboarding.setSelectedFields(selectedFields.value);
  } catch (e) {
    analyzeResult.value = { page_title: '', detected_type: 'unknown', fields: [] };
  } finally {
    analyzing.value = false;
  }
}

function onFieldToggle(name: string, checked: boolean) {
  fieldChecked.value[name] = checked;
  if (checked && !selectedFields.value.includes(name)) {
    selectedFields.value = [...selectedFields.value, name];
  } else if (!checked) {
    selectedFields.value = selectedFields.value.filter((f) => f !== name);
  }
  onboarding.setSelectedFields(selectedFields.value);
}

async function onFinish() {
  crawling.value = true;
  const url = sourceUrl.value || customUrl.value;
  try {
    if (url) await crawl(url, selectedFields.value);
  } catch {
    // mock 静默失败
  } finally {
    crawling.value = false;
  }
  onboarding.completeWizard();
  confetti({
    particleCount: 80,
    spread: 65,
    origin: { y: 0.6 }
  });
  router.replace({ name: 'simple-view' });
}

function onSkip() {
  onboarding.skipWizard();
  router.replace({ name: 'simple-view' });
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') onSkip();
}
</script>

<style scoped>
.wizard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  background: #F9FAFB;
  box-sizing: border-box;
}
.wizard__header {
  position: relative;
  max-width: 880px;
  margin: 0 auto;
  width: 100%;
}
.wizard__title {
  font-size: 24px;
  font-weight: 600;
  color: #1E3A8A;
  margin: 0 0 8px 0;
  text-align: center;
}
.wizard__subtitle {
  font-size: 14px;
  color: #6B7280;
  text-align: center;
  margin: 0 0 20px 0;
}
.wizard__steps { margin-bottom: 16px; }
.wizard__skip {
  position: absolute;
  top: 0;
  right: 0;
}
.wizard__body {
  flex: 1;
  max-width: 880px;
  width: 100%;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
}
.wizard__step-title { font-size: 18px; font-weight: 600; margin: 0; color: #111827; }
.wizard__step-desc { font-size: 13px; color: #6B7280; margin: 0 0 8px 0; }
.wizard__examples {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.wizard__example {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 18px 14px;
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.wizard__example:hover,
.wizard__example:focus,
.wizard__example--active {
  border-color: #3B82F6;
  background: #EFF6FF;
  outline: none;
}
.wizard__example-emoji { font-size: 28px; margin-bottom: 8px; }
.wizard__example-title { font-size: 14px; font-weight: 600; color: #1E3A8A; margin-bottom: 4px; }
.wizard__example-desc { font-size: 12px; color: #6B7280; }

.wizard__providers {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.wizard__provider {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 18px 16px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.wizard__provider:hover,
.wizard__provider:focus,
.wizard__provider--active {
  border-color: #3B82F6;
  background: #EFF6FF;
  outline: none;
}
.wizard__provider-name { font-size: 16px; font-weight: 600; color: #1E3A8A; margin-bottom: 6px; }
.wizard__provider-endpoint { font-size: 12px; color: #6B7280; margin-bottom: 8px; word-break: break-all; }
.wizard__provider-tag { font-size: 12px; color: #3B82F6; }
.wizard__test { display: flex; align-items: center; gap: 12px; }
.wizard__test-result { font-size: 13px; }
.wizard__test-result--ok { color: #10B981; }
.wizard__test-result--fail { color: #EF4444; }

.wizard__url-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}
.wizard__url-card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 14px 12px;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.wizard__url-card:hover,
.wizard__url-card:focus,
.wizard__url-card--active {
  border-color: #3B82F6;
  background: #EFF6FF;
  outline: none;
}
.wizard__url-card-title { font-size: 14px; font-weight: 600; color: #1E3A8A; margin-bottom: 4px; }
.wizard__url-card-url { font-size: 11px; color: #6B7280; word-break: break-all; }
.wizard__error { color: #EF4444; font-size: 12px; margin: 8px 0 0 0; }

.wizard__fields { display: flex; flex-direction: column; gap: 10px; }
.wizard__field {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  cursor: pointer;
}
.wizard__field-info { display: flex; flex-direction: column; gap: 4px; }
.wizard__field-name { font-size: 14px; font-weight: 600; color: #1E3A8A; }
.wizard__field-meta { font-size: 12px; color: #6B7280; }

.wizard__summary { margin: 0; }
.wizard__summary > div {
  display: grid;
  grid-template-columns: 120px 1fr;
  padding: 10px;
  border-bottom: 1px solid #F3F4F6;
  font-size: 14px;
}
.wizard__summary dt { color: #6B7280; }
.wizard__summary dd { margin: 0; color: #1F2937; }

.wizard__footer {
  max-width: 880px;
  width: 100%;
  margin: 24px auto 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
