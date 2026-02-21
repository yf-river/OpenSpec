# OpenSpec 操作手册

## 安装

```bash
# 进入 OpenSpec 仓库目录
cd /data/ida/claude/春节AI项目/编程范式/OpenSpec

# 安装依赖并构建
pnpm install

# 全局链接（需要先执行 pnpm setup 配置全局 bin 目录）
pnpm link --global

# 验证
openspec --version
```

## 在项目中初始化

```bash
# 为 Claude Code 和 Codex 同时安装
openspec init /path/to/project --tools codex,claude

# 仅安装其中一个
openspec init /path/to/project --tools claude
openspec init /path/to/project --tools codex
```

初始化后，项目中会生成：
- `openspec/` — 规格和变更管理目录
- `.claude/skills/` 或 `.codex/skills/` — AI agent 技能文件
- `.claude/commands/opsx/` 或 `.codex/prompts/` — 斜杠命令文件

## 斜杠命令一览

| 命令 | 用途 |
|------|------|
| `/opsx/explore` | 探索模式——深入思考想法、调研问题、明确需求 |
| `/opsx/propose` | 提出新变更——一步生成 proposal + specs + design + tasks |
| `/opsx/new` | 启动新变更——逐步创建各个产物 |
| `/opsx/continue` | 继续推进——创建下一个产物 |
| `/opsx/apply` | 按任务清单实现代码 |
| `/opsx/verify` | 验证实现与产物的一致性 |
| `/opsx/archive` | 归档已完成的变更 |

## 核心工作流 (spec-driven)

```
proposal → specs → design → tasks → apply
```

1. **proposal.md** — 描述变更的目的（为什么）和范围（改什么）
2. **specs/** — 详细的技术规格，每个能力一个 spec 文件
3. **design.md** — 技术设计方案（怎么做）
4. **tasks.md** — 实现任务清单（带复选框）
5. **apply** — 按任务清单逐项实现代码

## 典型使用场景

### 复杂需求（推荐完整流程）

```
/opsx/explore        ← 理清需求和方案
/opsx/propose        ← 生成完整提案
/opsx/apply          ← 按任务实现（结合 TDD）
/opsx/verify         ← 验证实现
/opsx/archive        ← 归档
```

### 中等需求（跳过探索）

```
/opsx/propose        ← 直接生成提案
/opsx/apply          ← 实现
/opsx/archive        ← 归档
```

### 逐步推进（精细控制每个产物）

```
/opsx/new            ← 创建变更，展示第一个产物模板
/opsx/continue       ← 逐个创建产物（每次一个）
/opsx/continue       ← 重复直到所有产物完成
/opsx/apply          ← 实现
/opsx/archive        ← 归档
```

### 简单 bug 修复

直接改代码即可，不需要走 OpenSpec 流程。

## CLI 命令参考

| 命令 | 用途 |
|------|------|
| `openspec init [path]` | 在项目中初始化 OpenSpec |
| `openspec update [path]` | 更新指令文件 |
| `openspec new change <name>` | 创建新的变更目录 |
| `openspec list` | 列出所有变更 |
| `openspec list --specs` | 列出所有规格 |
| `openspec show <item>` | 查看变更或规格详情 |
| `openspec status --change <name>` | 显示产物完成状态 |
| `openspec validate` | 校验变更和规格 |
| `openspec instructions <artifact> --change <name>` | 获取产物生成指令 |
| `openspec archive <name>` | 归档已完成的变更 |
| `openspec config list` | 查看配置 |
| `openspec config set <key> <value>` | 修改配置 |

## 目录结构

```
project/
├── openspec/
│   ├── config.yaml              # 项目配置
│   ├── specs/                   # 主规格（持久化）
│   │   └── <capability>/
│   │       └── spec.md
│   └── changes/                 # 变更（生命周期管理）
│       ├── <change-name>/
│       │   ├── .openspec.yaml   # 变更元数据
│       │   ├── proposal.md      # 提案
│       │   ├── specs/           # 增量规格
│       │   ├── design.md        # 技术设计
│       │   └── tasks.md         # 任务清单
│       └── archive/             # 已归档的变更
├── .claude/                     # Claude Code 集成
│   ├── skills/openspec-*/       # 技能文件
│   └── commands/opsx/           # 斜杠命令
└── .codex/                      # Codex 集成
    ├── skills/openspec-*/       # 技能文件
    └── prompts/opsx-*.md        # 斜杠命令
```

## 注意事项

- 斜杠命令由 AI agent 自动识别和执行，你不需要手动运行 `openspec` CLI
- `openspec init` 会同时生成 skills（技能文件）和 commands（斜杠命令）
- 变更归档后会移动到 `changes/archive/` 目录，增量规格会同步到主规格
- 所有产物都是 Markdown 文件，可以手动编辑
