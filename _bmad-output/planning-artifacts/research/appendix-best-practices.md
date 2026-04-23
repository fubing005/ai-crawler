
## 5. 爬虫场景最佳实践

### 5.1 反爬虫对策

Playwright 内置强大的反爬虫能力：

**1. 真实浏览器指纹**
```python
# 创建真实浏览器环境
context = await browser.new_context(
    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport={"width": 1920, "height": 1080},
    locale="zh-CN",
    timezone_id="Asia/Shanghai",
    permissions=["geolocation"],
    color_scheme="light",
    device_scale_factor=1,
)
```

**2. 支持 WebGL、WebRTC**
```python
# Playwright 自动支持 WebGL 和 WebRTC
# 无需额外配置，浏览器行为完全真实
```

**3. 代理配置**
```python
# 使用代理服务器
context = await browser.new_context(
    proxy={
        "server": "http://proxy.example.com:8080",
        "username": "user",
        "password": "pass"
    }
)
```

**4. 反自动化检测规避**
```python
# 使用浏览器参数避免被检测
browser = await p.chromium.launch(
    headless=True,
    args=[
        "--disable-blink-features=AutomationControlled",
        "--disable-dev-shm-usage",
        "--no-sandbox"
    ]
)

# 注入脚本修改 navigator.webdriver
await page.add_init_script("""
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    });
""")
```

**5. Cookie 和 localStorage 管理**
```python
# 从文件加载 cookies
cookies = json.loads(open("cookies.json").read())
await context.add_cookies(cookies)

# 设置 localStorage
await page.evaluate("""
    localStorage.setItem('key', 'value');
""")
```

### 5.2 数据提取策略

结合 AI 使用 Playwright 的完整流程：

**步骤 1：Playwright 渲染页面并获取 DOM**
```python
async def scrape_page_with_ai(url: str):
    browser = await playwright_pool.acquire()
    try:
        context = await browser.new_context()
        page = await context.new_page()
        
        # 访问页面
        await page.goto(url)
        
        # 等待页面完全加载
        await page.wait_for_load_state("networkidle")
        
        # 获取完整 HTML
        html = await page.content()
        
        return html
    finally:
        await playwright_pool.release(browser)
        await context.close()
```

**步骤 2：将 HTML 传递给 AI 模型分析**
```python
class AIService:
    def __init__(self):
        self.client = OpenAI()  # 或其他 AI 模型
    
    def analyze_page_structure(self, html: str) -> dict:
        """
        AI 分析页面结构，返回数据提取方案
        """
        # 提取页面片段（避免 token 超限）
        html_fragment = html[:10000]  # 前 10000 字符
        
        prompt = f"""
        分析以下 HTML 结构，识别数据字段并提供提取方案：
        
        {html_fragment}
        
        请返回 JSON 格式的提取方案：
        {{
            "page_type": "ecommerce|news|blog|...",
            "data_fields": [
                {{
                    "name": "title",
                    "selector": ".product-title",
                    "type": "text"
                }},
                {{
                    "name": "price",
                    "selector": ".product-price",
                    "type": "text"
                }}
            ],
            "extraction_strategy": "list|single"
        }}
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        
        return json.loads(response.choices[0].message.content)
```

**步骤 3：AI 返回 CSS 选择器或数据路径**

**步骤 4：Playwright 根据选择器提取数据**
```python
async def extract_data_with_selectors(page, selectors: dict):
    """
    根据 AI 返回的选择器提取数据
    """
    extraction_strategy = selectors["extraction_strategy"]
    data_fields = selectors["data_fields"]
    
    if extraction_strategy == "single":
        # 单条数据提取
        result = {}
        for field in data_fields:
            element = await page.wait_for_selector(field["selector"])
            if field["type"] == "text":
                result[field["name"]] = await element.text_content()
            elif field["type"] == "attribute":
                result[field["name"]] = await element.get_attribute(field["attr"])
        return result
    
    elif extraction_strategy == "list":
        # 列表数据提取
        items = await page.wait_for_selector(".item-container").all_inner_handles()
        results = []
        
        for item_handle in items:
            item_data = {}
            for field in data_fields:
                element = await item_handle.wait_for_selector(field["selector"])
                if field["type"] == "text":
                    item_data[field["name"]] = await elementari.text_content()
                elif field["type"] == "attribute":
                    item_data[field["name"]] = await element.get_attribute(field["attr"])
            results.append(item_data)
        
        return results
```

### 5.3 错误处理和重试机制

**完整的错误处理策略：**
```python
import logging
from typing import Optional, Dict, Any
import asyncio

logger = logging.getLogger(__name__)

class CrawlerError(Exception):
    """爬虫基础错误"""
    pass

class PageLoadError(CrawlerError):
    """页面加载错误"""
    pass

class TimeoutError(CrawlerError):
    """超时错误"""
    pass

class ScrapingError(CrawlerError):
    """数据提取错误"""
    pass

async def scrape_with_retry(
    url: str,
    max_retries: int = 3,
    retry_delay: int = 2,
    timeout: int = 30000
) -> Optional[Dict[str, Any]]:
    """
    带重试机制的爬取函数
    """
    for attempt in range(max_retries):
        try:
            browser = await playwright_pool.acquire()
            try:
                context = await browser.new_context()
                page = await context.new_page()
                
                # 设置超时
                page.set_default_timeout(timeout)
                
                try:
                    # 访问页面
                    await page.goto(url, timeout=timeout)
                    
                    # 等待页面加载
                    await page.wait_for_load_state("networkidle", timeout=timeout)
                    
                    # 检查是否有错误页面
                    error_element = await page.query_selector(".error-page, .error-404")
                    if error_element:
                        raise PageLoadError("页面显示错误")
                    
                    # 提取数据
                    html = await page.content()
                    
                    # AI 分析
                    ai_service = AIService()
                    analysis = ai_service.analyze_page_structure(html)
                    
                    # 提取数据
                    data = await extract_data_with_selectors(page, analysis)
                    
                    logger.info(f"成功爬取 {url}，获取 {len(data) if isinstance(data, list) else 1} 条数据")
                    return data
                    
                except Exception as e:
                    if "timeout" in str(e).lower():
                        raise TimeoutError(f"页面加载超时: {url}")
                    elif "net::" in str(e):
                        raise PageLoadError(f"网络错误: {url}")
                    else:
                        raise ScrapingError(f"数据提取失败: {str(e)}")
                        
            finally:
                await context.close()
                await playwright_pool.release(browser)
                
        except TimeoutError as e:
            logger.warning(f"尝试 {attempt + 1}/{max_retries}: {str(e)}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay * (attempt + 1))
            else:
                logger.error(f"重试 {max_retries} 次后仍然失败: {url}")
                raise
                
        except Exception as e:
            logger.error(f"爬取失败: {url}, 错误: {str(e)}")
            if attempt == max_retries - 1:
                raise CrawlerError(f"重试 {max_retries} 次后仍然失败: {str(e)}")
    
    return None
```

### 5.4 无限滚动和动态加载

**处理无限滚动：**
```python
async def scrape_infinite_scroll(page, max_scrolls: int = 10) -> str:
    """
    处理无限滚动页面
    """
    last_height = 0
    scroll_count = 0
    
    while scroll_count < max_scrolls:
        # 滚动到底部
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        
        # 等待新内容加载
        await asyncio.sleep(2)
        
        # 检查是否有加载指示器
        loading = await page.query_selector(".loading, .spinner")
        if loading:
            await page.wait_for_selector(".loading, .spinner", state="hidden")
        
        # 检查页面高度是否变化
        new_height = await page.evaluate("document.body.scrollHeight")
        if new_height == last_height:
            # 没有新内容加载，退出
            break
        
        last_height = new_height
        scroll_count += 1
    
    return await page.content()
```

### 5.5 性能优化技巧

**1. 阻止不必要的资源加载**
```python
# 阻止图片、字体、媒体文件加载
await page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2,mp4,webm}", lambda route: route.abort())

# 只加载必要的资源
await page.route("**/*", lambda route: route.continue_())
```

**2. 使用缓存**
```python
# 启用浏览器缓存
context = await browser.new_context(
    ignore_https_errors=True,
    accept_downloads=False
)
```

**3. 并发页面处理**
```python
# 在同一浏览器实例中创建多个页面
pages = []
for url in urls[:5]:  # 限制并发数
    page = await browser.new_page()
    pages.append(page)
    asyncio.create_task(page.goto(url))

# 等待所有页面加载完成
await asyncio.gather(*[p.wait_for_load_state("networkidle") for p in pages])

# 提取数据
results = [await p.content() for p in pages]
```

### 5.6 验证码处理

**基础验证码策略：**
```python
# 1. 检测验证码
captcha = await page.query_selector("img[src*='captcha'], .captcha")

if captcha:
    # 2. 使用 AI 或第三方服务识别
    captcha_text = await solve_captcha(page)
    
    # 3. 填写并提交
    await page.fill("input[name='captcha']", captcha_text)
    await page.click("button[type='submit']")
    
    # 4. 检查是否成功
    await page.wait_for_load_state("networkidle")
```

---

## 6. 与现有技术栈的协调

### 6.1 与 BeautifulSoup4/lxml 的关系

**定位：** 互补关系

**Playwright 的优势：**
- 处理动态内容（JavaScript 渲染）
- 处理复杂交互（点击、滚动、表单提交）
- 等待异步内容加载
- 执行 JavaScript 代码

**BeautifulSoup4/lxml 的优势：**
- 解析速度快（纯 Python 或 C 扩展）
- 内存占用低
- 适合处理大量静态 HTML
- API 简单易用

**使用策略：**
```python
def smart_scrape(url: str, use_ai: bool = True):
    """
    智能选择爬取策略
    """
    # 1. 首先尝试 httpx（最快）
    response = httpx.get(url, follow_redirects=True)
    html = response.text
    
    # 2. 检查是否需要 JavaScript 渲染
    if needs_javascript_rendering(html):
        # 使用 Playwright
        return scrape_with_playwright(url, use_ai)
    else:
        # 使用 BeautifulSoup4 解析
        return parse_with_bs4(html, use_ai)

def needs_javascript_rendering(html: str) -> bool:
    """
    检测页面是否需要 JavaScript 渲染
    """
    indicators = [
        "script.*innerHTML",
        "document.write",
        "window.location",
        "data-reactroot",
        "ng-app",
        "vue-app"
    ]
    
    for indicator in indicators:
        if re.search(indicator, html, re.IGNORECASE):
            return True
    
    return False
```

### 6.2 与 httpx 的关系

**定位：** 互补关系

**httpx 的优势：**
- 快速、轻量的 HTTP 客户端
- 支持 HTTP/2
- 内存占用极低
- 适合简单的 API 调用和静态资源获取

**Playwright 的优势：**
- 完整的浏览器环境
- 支持 Cookie、Session、LocalStorage
- 可以处理复杂的页面交互
- 支持 JavaScript 执行

**使用策略：**
```python
class CrawlerService:
    def ____init__(self):
        self.http_client = httpx.AsyncClient()
        self.playwright_pool = PlaywrightPool()
    
    async def scrape(self, url: str, force_browser: bool = False) -> dict:
        """
        智能选择爬取策略
        """
        if not force_browser and not self._needs_browser(url):
            # 使用 httpx
        return await self._scrape_with_httpx(url)
        else:
        # 使用 Playwright
        return await self._scrape_with_playwright(url)
    
    async def _needs_browser(self, url: str) -> bool:
        """
        判断是否需要浏览器
        """
        # 检查 URL 模式
        browser_patterns = [
            r"spa\.",
            r"react\.",
            r"vue\.",
            r"angular\."
        ]
        
        for pattern in browser_patterns:
            if re.search(pattern, url):
                return True
        
        # 可以添加更多判断逻辑
        return False
    
    async def _scrape_with_httpx(self, url: str) -> dict:
        """
        使用 httpx 爬取
        """
        response = await self.http_client.get(url)
        html = response.text
        
        # 使用 BeautifulSoup4 解析
        soup = BeautifulSoup(html, 'lxml')
        
        # 提取数据
        return {
            "url": url,
            "html": html[:[:1000],
            "status": "success"
        }
    
    async def _scrape_with_playwright(self, url: str) -> dict:
        """
        使用 Playwright 爬取
        """
        browser = await self.playwright_pool.acquire()
        try:
            context = await browser.new_context()
            page = await context.new_page()
            
            await page.goto(url)
            await page.wait_for_load_state("networkidle")
            
            html = await page.content()
            
            return {
                "url": url,
                "html": html[:[:1000],
                "status": "success"
            }
        finally:
            await self.playwright_pool.release(browser)
```

---

## 7. 安全和合规性增强

### 7.1 robots.txt 支持。

```python
import urllib.robotparser
from urllib.parse import urlparse

class RobotsTxtChecker:
    def __init__(self):
        self.parser = urllib.robotparser.RobotFileParser()
        self.user_agent = "MyCrawler/1.0"
    
    def can_fetch(self, url: str) -> bool:
        """
        检查是否可以爬取该 URL
        """
        parsed_url = urlparse(url)
        robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
        
        try:
            self.parser.set_url(robots_url)
            self.parser.read()
            
            return self.parser.can_fetch(self.user_agent, url)
        except Exception as e:
            logger.warning(f"无法读取 robots.txt: {robots_url}, 错误: {str(e)}")
            return True  # 默认允许
    
    def crawl_delay(self, url: str) -> Optional[float]:
        """
        获取爬取延迟时间（秒）
        """
        parsed_url = urlparse(url)
        robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
        
        try:
            self.parser.set_url(robots_url)
            self.parser.read()
            
            return self.parser.crawl_delay(self.user_agent)
        except Exception:
            return None
```

### 7.2 请求频率控制

```python
import time
from collections import defaultdict
from threading import Lock

class RateLimiter:
    def __init__(self, requests_per_second: float = 1.0):
        self.requests_per_second = requests_per_second
        self.min_interval = 1.0 / requests_per_second
        self.last_request_time = defaultdict(float)
        self.lock = Lock()
    
    async def wait_if_needed(self, identifier: str):
        """
        根据限制等待
        """
        with self.lock:
            now = time.time()
            last_time = self.last_request_time[identifier]
            
            if last_time > 0:
                elapsed = now - last_time
                if elapsed < self.min_interval:
                    wait_time = self.min_interval - elapsed
                    logger.debug(f"请求频率限制：等待 {wait_time:.2f} 秒")
                    await asyncio.sleep(wait_time)
            
            self.last_request_time[identifier] = time.time()

# 使用示例
rate_limiter = RateLimiter(requests_per_second=2.0)

async def scrape_with_rate_limit(url: str):
    """
    带频率限制的爬取
    """
    domain = urlparse(url).netloc
    await rate_limiter.wait_if_needed(domain)
    
    # 执行爬取...
    return await scrape_with_retry(url)
```

### 7.3 数据隐私保护

```python
# 1. 本地部署确保数据不离开本地环境
# 2. 加密存储敏感数据
from cryptography.fernet import Fernet

class DataEncryption:
    def __init__(self, key: bytes):
        self.cipher = Fernet(key)
    
    def encrypt(self, data: str) -> bytes:
        """
        加密数据
        """
        return self.cipher.encrypt(data.encode())
    
    def decrypt(self, encrypted_data: bytes) -> str:
        """
        解密数据
        """
        return self.cipher.decrypt(encrypted_data).decode()

# 3. 审计日志
import logging
from