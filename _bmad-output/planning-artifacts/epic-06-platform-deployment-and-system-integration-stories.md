---
epicId: "epic-06"
epicName: "平台部署和系统集成"
epicNumber: 6
relatedFRs: ["FR67", "FR68", "FR69", "FR70", "FR71", "FR72", "FR73", "FR74", "FR75", "FR76", "FR77", "FR78", "FR79", "FR80", "FR81", "FR82", "FR83", "FR84", "FR85"]
---

# Epic 6: 平台部署和系统集成 - Stories

## Epic 概述

**目标：** 用户可以在多个平台部署应用，并通过 API、SDK 和集成工具与其他系统交互。

**用户成果：**
- 在 Windows、macOS、Linux 安装应用
- 使用 Docker、Docker Compose、Kubernetes 部署
- 集成到 CI/CD 流程
- 访问 REST API 和 Python SDK
- 集成到数据仓库（Snowflake、BigQuery、Redshift）
- 集成到实时数据流（Kafka、Kinesis）
- 使用 Airflow Operator、Tableau 集成

**FRs 覆盖：** FR67-FR76, FR77-FR85

---

## Story 1: Windows 平台安装

**ID:** EPIC6-001

**优先级:** 高

**相关 FRs:** FR67

**用户故事：** 作为 Windows 用户，我可以安装应用程序到 Windows 10/11 系统，以便在本地使用爬虫工具。

**描述：**
提供 Windows 平台的安装包，支持 .exe 和 .msi 格式，确保安装过程简单、快速、可靠。

**Acceptance Criteria:**

1. **安装包格式**
   - [x] 提供 .exe 安装程序
   - [x] 提供 .msi 安装程序
   - [x] 支持 Windows 10（版本 1903 及以上）
   - [x] 支持 Windows 11（所有版本）

2. **安装过程**
   - [x] 安装向导提供简单友好的界面
   - [x] 支持中文和英文界面语言
   - [x] 显示安装协议（开源 MIT 协议）
   - [x] 允许用户选择安装路径（默认：C:\Program Files\BMadCrawler）
   - [x] 允许用户选择是否创建桌面快捷方式
   - [x] 允许用户选择是否添加到系统 PATH

3. **系统要求检查**
   - [x] 安装前检查操作系统版本
   - [x] 安装前检查可用磁盘空间（最少 10GB）
   - [x] 安装前检查可用内存（最少 4GB）
   - [x] 不满足要求时显示清晰错误提示

4. **依赖管理**
   - [x] 自动安装 Python 3.10+（如果未安装）
   - [x] 自动安装 PostgreSQL 数据库
   - [x] 自动配置 PostgreSQL 服务（开机启动）
   - [x] 自动初始化数据库和表结构
   - [x] 自动安装 Redis 服务

5. **安装后配置**
   - [x] 自动初始化配置文件
   - [x] 自动生成默认 API 密钥
   - [x] 自动创建系统服务（开机启动）
   - [x] 自动打开浏览器访问应用首页
   - [x] 显示安装成功消息

6. **卸载功能**
   - [x] 提供"添加/删除程序"中的卸载选项
   - [x] 卸载前询问是否保留用户数据
   - [x] 卸载时停止所有系统服务
   - [x] 卸载时清理注册表项
   - [x] 卸载后删除所有安装文件

**技术要求：**
- 使用 Inno Setup 或 NSIS 创建安装包
- 使用 Python 的 setuptools 或 py2exe 打包
- 系统服务使用 NSSM（Non-Sucking Service Manager）
- 安装过程包含数字签名（可选）

---

## Story 2: macOS 平台安装

**ID:** EPIC6-002

**优先级:** 高

**相关 FRs:** FR68

**用户故事：** 作为 macOS 用户，我可以安装应用程序到 macOS 10.15+ 系统，以便在本地使用爬虫工具。

**描述：**
提供 macOS 平台的安装包，支持 .dmg 格式，符合 macOS 设计规范和安全要求。

**Acceptance Criteria:**

1. **安装包格式**
   - [x] 提供 .dmg 磁盘镜像文件
   - [x] 支持 macOS 10.15 (Catalina) 及以上
   - [x] 支持 Apple Silicon (M1/M2) 和 Intel 芯片
   - [x] 提供通用二进制（Universal Binary）或分芯片版本

2. **安装过程**
   - [x] .dmg 文件双击自动挂载
   - [x] 拖拽应用到 Applications 文件夹
   - [x] 应用图标符合 macOS 设计规范
   - [x] 首次启动时显示安全许可提示
   - [x] 支持中文和英文界面语言



3. **系统要求检查**
   - [x] 首次启动检查 macOS 版本
   - [x] 检查可用磁盘空间（最少 10GB）
   - [x] 检查可用内存（最少 4GB）
   - [x] 不满足要求时显示清晰错误提示

4. **依赖管理**
   - [x] 应用内嵌 Python 运行时
   - [x] 自动初始化 PostgreSQL 数据库（使用 PostgreSQL.app）
   - [x] 自动配置数据库服务（使用 launchd）
   - [x] 自动初始化数据库和表结构
   - [x] 自动安装并配置 Redis（使用 Homebrew）

5. **安装后配置**
   - [x] 自动初始化配置文件（~/Library/Application Support/BMadCrawler）
   - [x] 自动生成默认 API 密钥
   - [x] 自动配置 launchd 服务（开机启动）
   - [x] 显示 macOS 通知（允许通知权限）
   - [x] 首次启动显示欢迎界面

6. **卸载功能**
   - [x] 提供 App 内的卸载功能
   - [x] 卸载前询问是否保留用户数据
   - [x] 卸载时停止所有 launchd 服务
   - [x] 卸载时清理 Application Support 目录
   - [x] 卸载时从 Dock 移除图标

**技术要求：**
- 使用 PyInstaller 或 py2app 打包
- 使用 create-dmg 工具创建 .dmg 文件
- 应用包含开发者签名（可选）
- 支持 macOS Gatekeeper 机制
- 系统服务使用 launchd

---

## Story 3: Linux 平台安装

**ID:** EPIC6-003

**优先级:** 高

**相关 FRs:** FR69

**用户故事：** 作为 Linux 用户，我可以安装应用程序到 Ubuntu、CentOS、Debian 系统，以便在本地使用爬虫工具。

**描述：**
提供 Linux 平台的安装包，支持 .deb、.rpm 格式和安装脚本，适配主流 Linux 发行版。

**Acceptance Criteria:**

1. **安装包格式**
   - [x] 提供 .deb 包（适用于 Ubuntu、Debian）
   - [x] 提供 .rpm 包（适用于 CentOS、RHEL）
   - [x] 提供 Python wheel 包 (.whl)
   - [x] 提供通用的安装脚本（install.sh）

2. **支持的发行版**
   - [x] Ubuntu 20.04 LTS 及以上
   - [x] Debian 10 (Buster) 及以上
   - [x] CentOS 7 及以上
   - [x] RHEL 8 及以上
   - [x] 支持其他基于 Debian/RHEL 的发行版

3. **安装过程**
   - [x] .deb/.rpm 包支持双击安装
   - [x] 安装脚本支持命令行安装
   - [x] 安装过程显示进度和状态
   - [x] 支持中文和英文界面语言（命令行）
   - [x] 安装时询问是否配置系统服务

4. **依赖管理**
   - [x] 自动安装 Python 3.10+（如果未安装）
   - [x] 自动安装 PostgreSQL 服务
   - [x] 自动初始化数据库和表结构
   - [x] 自动安装并启动 Redis 服务
   - [x] 自动安装 Playwright 及其浏览器依赖

5. **安装后配置**
   - [x] 自动初始化配置文件（/etc/bmad-crawler/）
   - [x] 自动生成默认 API 密钥
   - [x] 配置 systemd 服务（开机启动）
   - [x] 创建配置文件和日志目录
   - [x] 设置正确的文件权限

6. **卸载功能**
   - [x] 提供 apt-get remove / yum remove 命令
   - [x] 卸载前询问是否保留用户数据
   - [x] 卸载时停止 systemd 服务
   - [x] 卸载时清理配置文件
   - [x] 卸载时保留数据库数据（除非用户确认删除）

**技术要求：**
- 使用 stdeb 或 fpm 创建 .deb 包
- 使用 setuptools 或 fpm 创建 .rpm 包
- 使用 setuptools_scm 管理 wheel 包
- 系统服务使用 systemd
- 安装脚本使用 Shell 脚本（Bash）

---

## Story 4: Docker 容器化部署

**ID:** EPIC6-004

**优先级:** 高

**相关 FRs:** FR70

**用户故事：** 作为 DevOps 工程师，我可以使用 Docker 部署应用，以便实现容器化和环境隔离。

**描述：**
提供完整的 Docker 支持，包括 Dockerfile、多架构镜像和最佳实践配置。

**Acceptance Criteria:**

1. **Dockerfile**
   - [x] 提供优化的多阶段构建 Dockerfile
   - [x] 基于 Python 3.10+ 官方镜像
   - [x] 包含所有应用依赖
   - [x] 支持 Linux/AMD64 和 Linux/ARM64 架构
   - [x] 镜像大小优化（小于 500MB）

2. **镜像构建**
   - [x] 提供构建脚本（build.sh）
   - [x] 支持构建多架构镜像（buildx）
   - [x] 支持构建时传递参数（版本、环境等）
   - [x] 构建过程显示详细日志
   - [x] 构建完成后运行基本测试

3. **容器运行**
   - [x] 提供运行脚本（run.sh）
   - [x] 支持环境变量配置
   - [x] 支持挂载卷（配置、数据、日志）
   - [x] 支持端口映射（默认 8000）
   - [x] 支持自定义命令和参数

4. **服务集成**
   - [x] Dockerfile 包含 PostgreSQL 依赖说明
   - [x] Dockerfile 包含 Redis 依赖说明
   - [x] 提供 docker-compose 配置（见 Story 5）
   - [x] 支持连接外部数据库
   - [x] 支持连接外部 Redis

5. **健康检查**
   - [x] Dockerfile 包含 HEALTHCHECK 指令
   - [x] 提供 /health 端点
   - [x] 健康检查间隔 30 秒
   - [x] 健康检查超时 10 秒
   - [x] 健康失败后重试 3 次

6. **镜像管理**
   - [x] 提供镜像版本标签（semver）
   - [x] 提供最新（latest）标签
   - [x] 支持镜像推送到 Docker Hub
   - [x] 支持镜像推送到私有仓库
   - [x] 提供镜像清理脚本

**技术要求：**
- 使用 Dockerfile 最佳实践（多阶段构建、缓存优化）
- 使用 Docker Buildx 构建多架构镜像
- 使用 Alpine Linux 或 Debian Slim 作为基础镜像
- 镜像推送到 Docker Hub 或私有仓库
- 提供完整的 Docker 文档和示例

---

## Story 5: Docker Compose 部署

**ID:** EPIC6-005

**优先级:** 高

**相关 FRs:** FR71

**用户故事：** 作为开发者，我可以使用 Docker Compose 一键部署完整的应用堆栈，以便快速搭建开发或生产环境。

**描述：**
提供完整的 docker-compose.yml 配置，包括应用、数据库、缓存和其他依赖服务。

**Acceptance Criteria:**

1. **Docker Compose 配置**
   - [x] 提供 docker-compose.yml 配置文件
   - [x] 包含应用服务（bmad-crawler）
   - [x] 包含 PostgreSQL 服务
   - [x] 包含 Redis 服务
   - [x] 使用官方基础镜像（PostgreSQL、Redis）

2. **网络配置**
   - [x] 创建独立的 Docker 网络
   - [x] 服务间使用服务名通信
   - [x] 应用端口映射到主机 8000
   - [x] 支持自定义端口配置

3. **卷配置**
   - [x] PostgreSQL 数据卷持久化
   - [x] Redis 数据卷持久化
   - [x] 应用配置卷挂载
   - [x] 应用日志卷挂载
   - [x] 支持自定义卷路径

4. **环境变量**
   - [x] 提供 .env 示例文件
   - [x] 支持 .env 文件配置敏感信息
   - [x] 环境变量包含数据库连接信息
   - [x] 环境变量包含 Redis 连接信息
   - [x] 环境变量包含 API 密钥

5. **健康检查和依赖**
   - [x] PostgreSQL 健康检查
   - [x] Redis 健康检查
   - [x] 应用服务依赖 PostgreSQL 和 Redis
   - [x] 服务启动顺序控制（depends_on）
   - [x] 启动失败时显示清晰错误信息

6. **扩展配置**
   - [x] 提供 docker-compose.prod.yml 生产环境配置
   - [x] 提供 docker-compose.dev.yml 开发环境配置
   - [x] 支持多环境配置合并
   - [x] 支持应用服务扩容（scale）
   - [x] 包含日志驱动配置

**技术要求：**
- 使用 Docker Compose v2 语法
- 支持环境变量替换（${VAR_NAME}）
- 使用命名卷（Named Volumes）持久化数据
- 提供完整的启动和停止脚本
- 提供 Docker Compose 管理命令文档

---

## Story 6: Kubernetes 部署

**ID:** EPIC6-006

**优先级:** 中

**相关 FRs:** FR72

**用户故事：** 作为运维工程师，我可以使用 Kubernetes 部署应用，以便实现高可用、可扩展的生产环境。

**描述：**
提供完整的 Kubernetes 部署配置，包括 Deployment、Service、ConfigMap、Secret 和 Helm Charts。

**Acceptance Criteria:**

1. **Kubernetes 资源配置**
   - [x] 提供 Deployment 配置文件
   - [x] 提供 Service 配置文件（ClusterIP、LoadBalancer）
   - [x] 提供 ConfigMap 配置文件
   - [x] 提供 Secret 配置文件（敏感信息）
   - [x] 提供 Ingress 配置文件（可选）

2. **Deployment 配置**
   - [x] 设置资源限制和请求（CPU、内存）
   - [x] 支持多副本部署（ReplicaSet）
   - [x] 使用健康检查探针（livenessProbe、readinessProbe）
   - [x] 滚动更新策略（RollingUpdate）
   - [x] 支持自定义标签和注解

3. **Service 配置**
   - [x] ClusterIP 服务内部通信
   - [x] LoadBalancer 服务外部访问（可选）
   - [x] 配置服务端口（8000）
   - [x] 支持 sessionAffinity
   - [x] 提供服务发现配置

4. **存储配置**
   - [x] 提供 PVC（Persistent Volume Claim）配置
   - [x] PostgreSQL 数据持久化
   - [x] Redis 数据持久化
   - [x] 应用日志持久化
   - [x] 支持动态存储类（StorageClass）

5. **Helm Charts**
   - [x] 提供完整的 Helm Chart
   - [x] 使用 Helm 3 语法
   - [x] 包含 Chart.yaml 和 values.yaml
   - [x] 支持参数化配置
   - [x] 包含模板和笔记（README）

6. **部署脚本和文档**
   - [x] 提供 kubectl 部署脚本
   - [x] 提供 Helm 部署脚本
   - [x] 提供升级和回滚脚本
   - [x] 提供完整的部署文档
   - [x] 包含故障排查指南

**技术要求：**
- 使用 Kubernetes API version 1.28+
- 使用 Helm 3 打包 Charts
- 遵循 Kubernetes 最佳实践
- 支持多种存储后端（NFS、Ceph、云存储）
- 包含 Prometheus 监控指标

---

## Story 7: 应用更新和版本管理

**ID:** EPIC6-007

**优先级:** 中

**相关 FRs:** FR74, FR75, FR76

**用户故事：** 作为用户，我可以检查应用更新、执行自动更新，并在更新失败时回滚到之前版本，以便保持应用的稳定性和安全性。

**描述：**
提供完整的应用更新机制，包括自动检查、在线更新、离线更新和版本回滚功能。

**Acceptance Criteria:**

1. **自动更新检查**
   - [x] 启动时自动检查更新（可配置禁用）
   - [x] 每小时检查一次更新（可配置间隔）
   - [x] 检查更新时显示通知（仅在后台检查）
   - [x] 显示当前版本和最新版本
   - [x] 检查更新失败时显示错误（不影响应用使用）

2. **在线更新功能**
   - [x] 有更新时显示"立即更新"按钮
   - [x] 点击"立即更新"后显示更新进度
   - [x] 下载更新包时显示下载进度
   - [x] 更新前显示更新内容说明（Changelog）
   - [x] 更新前询问用户确认
   - [x] 更新后自动重启应用

3. **离线更新功能**
   - [x] 提供下载离线安装包选项
   - [x] 支持手动安装离线包（拖拽或选择文件）
   - [x] 离线更新前验证包完整性（校验和）
   - [x] 离线更新前验证签名（如果包已签名）
   - [x] 离线更新失败时显示清晰错误
   - [x] 离线更新成功后清理临时文件

4. **版本回滚功能**
   - [x] 更新前自动备份当前版本
   - [x] 更新失败时自动提示回滚
   - [x] 提供"回滚到之前版本"按钮
   - [x] 回滚前显示版本列表和时间戳
   - [x] 回滚过程显示进度
   - [x] 回滚成功后显示确认消息

5. **更新配置**
   - [x] 设置页面提供更新配置选项
   - [x] 可配置"自动检查更新"开关
   - [x] 可配置检查更新间隔（1-24 小时）
   - [x] 可配置"自动下载更新"开关
   - [x] 可配置"自动安装更新"开关
   - [x] 可配置"保留最近 N 个版本"（1-10）

6. **更新日志和通知**
   - [x] 记录所有更新操作到日志
   - [x] 记录更新版本和时间
   - [x] 记录更新成功/失败状态
   - [x] 更新完成后发送通知（系统通知、邮件）
   - [x] 更新失败后发送错误通知
   - [x] 提供更新历史查看

**技术要求：**
- 使用语义化版本管理（Semantic Versioning）
- 更新包使用 GPG 签名（可选）
- 备份使用压缩和加密（AES-256）
- 更新服务器提供 REST API
- 更新进度使用 WebSocket 推送

## Story 8: CI/CD 管道集成

**ID:** EPIC6-008

**优先级:** 中

**相关 FRs:** FR73

**用户故事：** 作为 DevOps 工程师，我可以将爬虫工具集成到 CI/CD 管道中，以便自动化部署和测试。

**描述：**
提供完整的 CI/CD 集成支持，包括 GitHub Actions、GitLab CI、Jenkins 等主流 CI/CD 工具的配置示例。

**Acceptance Criteria:**

1. **GitHub Actions 支持**
   - [x] 提供 GitHub Actions workflow 配置文件
   - [x] 支持自动化构建 Docker 镜像
   - [x] 支持自动化运行测试
   - [x] 支持自动化部署到生产环境
   - [x] 提供工作流示例（.github/workflows/*.yml）

2. **GitLab CI 支持**
   - [x] 提供 GitLab CI 配置文件（.gitlab-ci.yml）
   - [x] 支持多阶段构建（build、test、deploy）
   - [x] 支持缓存优化（pip、Docker 层）
   - [x] 支持手动触发部署
   - [x] 支持环境变量配置

3. **Jenkins 支持**
   - [x] 提供 Jenkinsfile 配置
   - [x] 支持 Jenkins Pipeline 语法
   - [x] 支持多分支 Pipeline
   - [x] 支持构建参数化
   - [x] 提供完整示例和文档

4. **CI/CD 最佳实践**
   - [x] 自动化版本号生成（基于 Git tag 或 commit）
   - [x] 代码提交自动触发 CI
   - [x] 合并到 main/master 分支自动触发部署
   - [x] 构建失败时发送通知（Slack、Email）
   - [x] 部署成功后发送通知

5. **测试集成**
   - [x] CI 流程运行单元测试
   - [x] CI 流程运行集成测试
   - [x] CI 流程运行代码覆盖率检查（覆盖率 > 80%）
   - [x] CI 流程运行代码质量检查（SonarQube、pylint）
   - [x] 测试失败时阻止部署

6. **部署自动化**
   - [x] 支持 Docker 镜像自动推送到仓库
   - [x] 支持 Kubernetes Helm 自动部署
   - [x] 支持配置文件自动更新（ConfigMap、Secret）
   - [x] 支持蓝绿部署（Blue-Green Deployment）
   - [x] 支持滚动更新（Rolling Update）

**技术要求：**
- CI/CD 配置使用 YAML 格式
- 支持 Docker 镜像构建和推送
- 支持 Helm 部署
- 支持环境变量和密钥管理
- 提供完整的 CI/CD 文档和示例

---

## Story 9: ETL 流程集成

**ID:** EPIC6-009

**优先级:** 中

**相关 FRs:** FR77

**用户故事：** 作为数据工程师，我可以将爬虫数据集成到 ETL 流程中，以便自动化数据处理和分析。

**描述：**
提供完整的 ETL 集成支持，支持主流 ETL 工具和自定义脚本。

**Acceptance Criteria:**

1. **Airflow 集成**
   - [x] 提供自定义 Airflow Operator
   - [x] 支持在 Airflow DAG 中定义爬虫任务
   - [x] 支持 Airflow 任务依赖配置
   - [x] 支持 Airflow 重试和失败处理
   - [x] 提供完整示例和文档（见 Story 11）

2. **Apache Spark 集成**
   - [x] 提供 Spark Connector
   - [x] 支持从 PostgreSQL 读取爬虫数据
   - [x] 支持 Spark DataFrame 处理
   - [x] 支持批量数据加载
   - [x] 提供示例代码和文档

3. **Apache Flink 集成**
   - [x] 提供 Flink Sink Connector
   - [x] 支持实时数据流处理
   - [x] 支持数据管道配置
   - [x] 支持故障恢复和状态管理
   - [x] 提供示例代码和文档

4. **ETL 工具支持**
   - [x] 支持 Talend Data Integration
   - [x] 支持 Informatica PowerCenter
   - [x] 支持 Pentaho Data Integration (Kettle)
   - [x] 提供连接器或 API 接口
   - [x] 提供配置指南

5. **数据导出接口**
   - [x] REST API 提供数据批量导出端点
   - [x] 支持 SQL 查询接口（通过 PostgreSQL）
   - [x] 支持增量数据导出（基于时间戳）
   - [x] 支持过滤和分页导出
   - [x] 导出数据支持多种格式（JSON、CSV、Parquet）

6. **ETL 监控**
   - [x] 提供 ETL 任务状态监控 API
   - [x] 记录数据导出操作日志
   - [x] 记录数据量和时间统计
   - [x] 支持数据导出通知（Webhook）
   - [x] 提供数据导出历史查看

**技术要求：**
- 使用 PostgreSQL 作为 ETL 数据源
- 提供 REST API 供 ETL 工具调用
- 支持多种数据格式导出
- 支持增量数据同步
- 提供完整的集成文档和示例

---

## Story 10: 数据仓库集成

**ID:** EPIC6-010

**优先级:** 中

**相关 FRs:** FR78

**用户故事：** 作为数据工程师，我可以将爬虫数据直接加载到数据仓库，以便进行大规模数据分析和 BI 报表。

**描述：**
提供完整的数据仓库集成支持，支持 Snowflake、BigQuery、Redshift 等主流数据仓库。

**Acceptance Criteria:**

1. **Snowflake 集成**
   - [x] 提供 Snowflake 连接配置界面
   - [x] 支持自动创建数据仓库、数据库、Schema
   - [x] 支持自动创建表结构
   - [x] 支持批量数据加载（COPY 命令）
   - [x] 支持增量数据同步（MERGE 语句）

2. **BigQuery 集成**
   - [x] 提供 BigQuery 连接配置界面
   - [x] 支持自动创建数据集和表
   - [x] 支持批量数据加载（load API）
   - [x] 支持 Schema 自动推断
   - [x] 支持分区和聚簇表配置

3. **Redshift 集成**
   - [x] 提供 Redshift 连接配置界面
   - [x] 支持自动创建 Schema 和表
   - [x] 支持批量数据加载（COPY 命令）
   - [x]` 支持 S3 作为数据暂存区
   - [x] 支持数据压缩（GZIP、SNAPPY）

4. **数据同步配置**
   - [x] 提供数据同步配置界面
   - [x] 支持设置同步频率（实时、定时）
   - [x] 支持字段映射和转换
   - [x] 支持数据过滤条件
   - [x] 支持错误数据处理（跳过、记录、停止）

5. **同步性能优化**
   - [x] 支持批量插入（批次大小可配置）
   - [x] 支持并行数据加载
   - [x] 支持数据压缩传输
   - [x] 支持增量同步（减少数据传输）
   - [x] 提供同步性能统计

6. **同步监控和日志**
   - [x] 显示同步任务状态
   - [x] 显示同步进度和统计
   - [x] 记录同步操作日志
   - [x] 记录同步错误和警告
   - [x] 支持同步失败重试

**技术要求：**
- 使用 Snowflake Connector for Python
- 使用 google-cloud-bigquery 库
- 使用 psycopg2 或 Redshift Connector
- 支持多种数据类型映射
- 支持事务和回滚

---

## Story 11: Python SDK 和 Airflow Operator

**ID:** EPIC6-011

**优先级:** 中

**相关 FRs:** FR80, FR81

**用户故事：** 作为开发者，我可以使用 Python SDK 在 Jupyter Notebook 或脚本中控制爬虫，并使用 Airflow Operator 在 Airflow 中编排任务。

**描述：**
提供完整的 Python SDK 和 Airflow Operator，支持程序化控制和工作流集成。

**Acceptance Criteria:**

1. **Python SDK 基础功能**
   - [x] 提供易于安装的 pip 包（pip install bmad-crawler-sdk）
   - [x] 提供清晰的 API 文档（Sphinx、ReadTheDocs）
   - [x] 支持 Python 3.8+
   - [x] 提供类型提示（Type Hints）
   - [x] 提供完整的单元测试

2. **SDK 核心功能**
   - [x] 创建爬取任务（create_task）
   - [x] 启动任务（start_task）
   - [x] 暂停任务（pause_task）
   - [x] 恢复任务（resume_task）
   - [x] 取消任务（cancel_task）
   - [x] 查询任务状态（get_task_status）

3. **SDK 数据访问**
   - [x] 查询爬取数据（query_data）
   - [x] 导出数据（export_data）
   - [x] 按任务 ID 查询数据（get_task_data）
   - [x] 支持过滤和分页
   - [x] 支持 SQL 查询

4. **Jupyter Notebook 支持**
   - [x] 提供 Jupyter Notebook 示例
   - [x] 支持数据可视化（集成 Pandas、Matplotlib）
   - [x] 支持交互式任务控制
   - [x] 支持实时进度显示（IPython widgets）
   - [x] 提供完整的使用教程

5. **Airflow Operator**
   - [x] 提供自定义 Airflow Operator（BMadCrawlerOperator）
   - [x] 支持 Airflow 2.x
   - [x] 支持通过 Operator 参数配置任务
   - [x] 支持 Airflow XCom 数据传递
   - [x] 支持 Airflow 任务依赖（upstream/downstream）

6. **Airflow 示例和文档**
   - [x] 提供 DAG 示例（.py 文件）
   - [x] 提供单任务 DAG 示例
   - [x] 提供多任务并行 DAG 示例
   - [x] 提供任务链式依赖 DAG 示例
   - [x] 提供完整的 Operator 文档

**技术要求：**
- SDK 使用 FastAPI 客户端
- SDK 支持异步和同步调用
- SDK 使用 requests 或 httpx 库
- Airflow Operator 使用 Apache Airflow BaseOperator
- SDK 文档使用 Sphinx 自动生成

---

## Story 12: REST API、Webhook 和系统集成

**ID:** EPIC6-012

**优先级:** 中

**相关 FRs:** FR79, FR82, FR83, FR84, FR85

**用户故事：** 作为开发者，我可以使用 REST API 控制爬虫，配置 Webhook 接收事件通知，并集成 Tableau 和系统调度器。

**描述：**
提供完整的 REST API、Webhook 支持和系统集成功能。

**Acceptance Criteria:**

1. **REST API 设计**
   - [x] 提供完整的 RESTful API
   - [x] 提供 OpenAPI (Swagger) 规范文档
   - [x] 支持 API 版本控制（/v1/）
   - [x] 支持 CORS（跨域资源共享）
   - [x] 提供 API 密钥认证

2. **API 核心端点**
   - [x] POST /v1/tasks - 创建任务
   - [x] GET /v1/tasks - 查询任务列表
   - [x] GET /v1/tasks/{id} - 查询任务详情
   - [x] PUT /v1/tasks/{id} - 更新任务
   - [x] DELETE /v1/tasks/{id} - 删除任务
   - [x] POST /v1/tasks/{id}/start - 启动任务
   - [x] POST /v1/tasks/{id}/pause - 暂停任务
   - [x] POST /v1/tasks/{id}/resume - 恢复任务
   - [x] POST /v1/tasks/{id}/cancel - 取消任务
   - [x] GET /v1/tasks/{id}/logs - 查询任务日志
   - [x] GET /v1/tasks/{id}/data - 查询任务数据

3. **API 数据端点**
   - [x] GET /v1/data - 查询爬取数据
   - [x] POST /v1/data/export - 导出数据
   - [x] GET /v1/data/sources - 查询数据源列表
   - [x] GET /v1/data/{source_id} - 查询特定源数据
   - [x] 支持过滤、排序、分页

4. **Webhook 配置**
   - [x] 提供界面和 API 创建 Webhook
   - [x] 支持配置 Webhook URL
   - [x] 支持选择事件类型（任务完成、失败、数据更新等）
   - [x] 支持配置请求头（Authorization、Content-Type）
   - [x] 支持配置重试策略（重试次数、间隔）

5. **Webhook 事件**
   - [x] 任务创建事件（task.created）
   - [x] 任务启动事件（task.started）
   - [x] 任务完成事件（task.completed）
   - [x] 任务失败事件（task.failed）
   - [x] 数据导出事件（data.exported）
   - [x] 系统告警事件（system.alert）

6. **系统集成**
   - [x] Tableau 集成：支持从 PostgreSQL 连接数据源
   - [x] Windows Task Scheduler：提供任务调度示例配置
   - [x] macOS launchd：提供 launchd plist 配置文件
   - [x] Linux cron：提供 crontab 配置示例
   - [x] Kafka 集成：提供 Kafka Producer
   - [x] Kinesis 集成：提供 Kinesis Producer

7. **API 监控和限流**
   - [x] 提供 API 使用统计
   - [x] 提供 API 响应时间监控
   - [x] 支持 API 速率限制（每分钟请求数）
   - [x] 提供 API 访问日志
   - [x] 支持 API 密钥权限管理

**技术要求：**
- 使用 FastAPI 构建 REST API
- 使用 OpenAPI 生成文档（Swagger UI、ReDoc）
- 使用 JWT 或 API Key 认证
- Webhook 使用异步 HTTP 客户端
- 支持多种消息队列（Kafka、Kinesis）

---

## 总结

**总计：** 12 个 Stories

**覆盖的 FRs：** FR67-FR76, FR77-FR85

**技术栈：**
- 容器化：Docker、Docker Compose、Kubernetes、Helm
- 包管理：Python setuptools、pip、wheel
- 安装工具：Inno Setup、NSIS、py2app
- CI/CD：GitHub Actions、GitLab CI、Jenkins
- SDK：Python SDK (requests、httpx)
- API：FastAPI、OpenAPI (Swagger)
- 数据仓库：Snowflake、BigQuery、Redshift
- 消息队列：Kafka、Kinesis
- 工作流：Airflow
- 系统服务：systemd、launchd、Windows Service
