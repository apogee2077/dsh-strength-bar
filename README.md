# 强度滑杆 / Strength Slider

> A ChatGPT-style strength slider for **DeepSeek Harness (DSH)** — pick model, reasoning effort and agent preset from one compact capsule above the composer.

**当前版本：V1.0.1**

![强度滑杆预览](docs/preview.png)

在 DSH Web 输入框工具行里、发送键左边放一枚紧凑的强度胶囊（高约 28px）。点一下才在胶囊正上方弹出 ChatGPT 风格的卡片，卡片的中线与胶囊中线对齐（靠近屏幕边缘时会自动平移，避免出界）：大标题显示当前档位，下面是可拖拽的紫色滑杆，上方有闪电图标与重置按钮，底部三个分段标签切换「模型 / 思考 / 模式」。弹窗是绝对定位的浮层，会盖住输入框区域，但不改变页面布局；点外部或按 Esc 收起。

## 行为

- **收起状态**：胶囊始终只显示当前模型名与思考强度（如「DeepSeek-V4.1-Flash · Max」），不随弹窗里切换到哪个维度而变化；模型名和强度都完整显示，不做省略。

- **统一的档位视觉**：模型、思考、模式三个滑块共用同一套逻辑——低档蓝色渐变，向高档过渡到蓝紫/紫红，最高档出现星点、流光、发光，标题与胶囊一起变色；档位间的小白点标出每一档。
- **滑杆形状（V1.0.1）**：轨道是 40px 厚的胶囊，两端为半径 20px 的**正半圆**；滑块是直径 42px 的**正圆**白色圆钮，圆心正好落在轨道端帽的圆心上，因此滑到最左/最右时圆钮与半圆端帽严丝合缝地重合，不再出现「圆角矩形套圆角矩形」。圆钮直径比轨道厚 2px（上下各露出 1px），带一圈柔和投影与最高档的紫色微光。圆钮由内联 SVG `<circle>` 绘制，轨道/填充用 `clip-path` 裁成胶囊，并按实测尺寸写入 px 圆角——宿主页面或残留样式再怎么覆盖 `border-radius` 也改不坏这个形状。
- **思考**：读取当前模型实际声明的 effort 档位（DeepSeek 为 Off / Low / High / Max），拖动即切换；最高档触发星辉。
- **模型**：滑杆在模型目录中逐档切换；切换模型后 effort 回到该模型的默认档。
- **模式**：空白会话中直接切换当前会话的 Agent 预设（标准 / PTC / 极简 / 创造 等）；已有会话显示**当前任务的实际模式**（例如「创造模式」），滑块锁定并提示「已锁定」，不能再改。
- 右侧圆形箭头恢复当前维度的默认值。
- 点标题下的副标题（模型名 / 提供方）可在「模型」与「思考」之间快速切换。

## 安装

### 从 GitHub 安装

在 DSH 的「设置 → 插件 → 添加插件」里填写本仓库地址，或使用命令行：

```bash
dsh plugin add https://github.com/apogee2077/dsh-strength-bar
```

插件安装后名称为 `@local/dsh-strength-bar`，并会出现在 profile 的 `dsh.profile.bundles` 列表里。浏览器端 bundle 由 DSH 的 client-modules 在页面加载时提供；安装/更新后刷新一次页面（或重开窗口）即可看到新版本。

### 手动加入 profile

如果不用插件管理器，可以编辑 `~/.dsh/profiles/<profile>/package.json`：

```json
{
  "dsh": {
    "profile": {
      "bundles": ["...", "@local/dsh-strength-bar"]
    }
  },
  "dependencies": {
    "@local/dsh-strength-bar": "github:apogee2077/dsh-strength-bar"
  }
}
```

然后在 profile 目录执行 `pnpm install`，重开 DSH。

### 本地开发

```json
"@local/dsh-strength-bar": "link:D:/AI/DeepSeek_Files/dsh-strength-bar"
```

`link:` 指向本目录时，修改 `client.js` 后刷新页面即可；如果 DSH 开着 HMR，也可以在插件重载后直接看到变化。

## 设置

弹窗左上角的闪电按钮是设置入口：

- **调整顺序**：在「模型 / 思考 / 模式」里用 ↑/↓ 调整各项在滑杆上的顺序，例如把 Pro 调到 Flash 前面。
- **自定义名称**：给任意模型、强度档位或模式起一个显示名（如把 DeepSeek-V4-Pro 显示成 GPT-6 Astra）。只影响弹窗与胶囊的文字，不会改变 DSH 实际使用的模型、强度或模式。
- **恢复默认**：清除全部自定义名称与顺序；需要点两次确认。
- 设置保存在浏览器 `localStorage`，只属于当前浏览器 profile。

卡片由两部分组成：`conversation.input.right` 里的胶囊入口（发送键左边）和紧贴它正上方的绝对定位浮层；同时占用 `conversation.input.model` 座位，因此输入框工具行里原来那个模型选择器会被这枚胶囊取代。

## 文件

- `client.js` — 浏览器端全部实现（胶囊、弹窗、滑杆、动画、三个维度的数据与操作）。滑杆几何常量在文件顶部：`TRACK = 40`（轨道厚度）、`CAP = 20`（端帽半径）、`THUMB = 42`（圆钮直径）。
- `index.js` — Host 端空实现，只用于让 bundle 行可加载。
- `cordis.patch.yml` — 插入 `strength-bar` 行。
- `locale/zh.json`、`locale/en.json` — 插件管理页的标题与描述。
- `icon.svg` — 插件图标。
- `docs/preview.png` — 预览图。
- `CHANGELOG.md` — 版本改动记录。
- `legacy/v1.0.0/` — 改动前的 V1.0.0 原样存档。

## 版本

- **V1.0.1（当前）** — 滑杆改为正圆滑块 + 半圆端帽胶囊轨道；几何、点击映射与填充端点随之一并修正。详见 `CHANGELOG.md`。
- **V1.0.0（存档）** — 改动前的原始版本，完整保留在 [`legacy/v1.0.0/`](legacy/v1.0.0/)，其 `package.json` 仍为 `1.0.0`，`client.js` 未作任何修改。需要回退时，把该目录内容覆盖回仓库根目录即可。

## 停用

在「设置 → 插件」中禁用 **强度滑杆**，或从 profile 中移除 `@local/dsh-strength-bar`；禁用后原来的模型选择器会恢复。

## 许可证

[MIT](LICENSE)
