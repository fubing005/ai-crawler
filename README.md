# AI 驱动的通用爬虫框架

## 项目概述

本项目使用 BMad 方法论开发一个 AI 驱动的通用爬虫框架。通过人工智能自动学习网站结构，彻底改变传统爬虫的开发和维护方式，让数据采集变得前所未有的简单。

### 核心特性

- **零代码体验**：无需编写任何代码，只需自然语言描述
- **AI 驱动**：利用大语言模型理解网页结构和内容
- **本地部署**：数据完全本地化，保护隐私和合规性
- **通用性**：适用于各种网站和数据类型
- **易用性**：像使用搜索引擎一样简单

## 技术栈

- **编程语言**：Python
- **部署方式**：本地部署（非云端、非 SaaS）
- **数据存储**：本地文件系统

## 项目结构

```
vscode_bmad_method_test/
├── _bmad/                    # BMad 框架配置和模块
│   ├── _config/             # 框架配置文件
│   ├── bmm/                 # BMM 模块（业务方法论）
│   └── core/                # 核心模块
├── .kilocode/               # BMad 技能定义
│   └── skills/              # 各种工作流技能
├── _bmad-output/            # 生成的规划文档（PRD、产品简报等）
│   ├── planning-artifacts/  # 规划阶段产物
│   └── implementation-artifacts/  # 实现阶段产物
├── docs/                    # 项目知识库
├── .gitignore              # Git 忽略文件配置
└── README.md               # 项目说明文档
```

## 快速开始

### 前置要求

- Python 3.8+
- BMad 框架 v6.3.0

### 安装步骤

1. 克隆仓库
```bash
git clone <repository-url>
cd vscode_bmad_method_test
```

2. 创建虚拟环境（推荐）
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

3. 安装依赖（待补充）
```bash
pip install -r requirements.txt
```

### 使用 BMad 框架

BMad 框架已配置完成，可以使用以下技能：

- **产品规划**：创建产品简报、PRD、UX 设计
- **技术设计**：创建架构设计、Epic 和用户故事
- **开发实施**：故事开发、代码审查、测试生成

详细使用方法请参考 BMad 文档：https://docs.bmad-method.org/

## 文档

- [产品需求文档 (PRD)](_bmad-output/planning-artifacts/prd.md) - 完整的产品需求规格说明
- [产品简报](_bmad-output/planning-artifacts/product-brief-ai-crawler.md) - 产品概念和愿景
- [产品简报精简版](_bmad-output/planning-artifacts/product-brief-ai-crawler-distillate.md) - 用于下游工作流的精简版本

## 开发计划

### 第一阶段（MVP）
- ✅ 产品规划和需求分析
- ⏳ 架构设计
- ⏳ 核心功能开发
- ⏳ 测试和验证

### 后续阶段
- 高级反爬虫机制
- 数据清洗和转换
- 实时监控和告警
- 分布式爬取支持

## 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 作者：Shalabing
- 项目链接：[https://github.com/fubing005/ai-agent-spider](https://github.com/fubing005/ai-agent-spider)

## 致谢

- BMad 方法论团队
- 所有贡献者

---

**注意**：本项目目前处于规划阶段，核心功能正在开发中。
