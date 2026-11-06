# dsh-mobile

DeepSeek Harness (DSH) Web GUI 移动端视口锁定、滚动溢出阻断及虚拟键盘交互适配插件。

## 功能特性

- **视口锁定**：防止页面（`html, body`）在触摸拖拽时滚入底部黑屏空白区域。
- **滚动阻断**：使用 `overscroll-behavior-y: contain` 将滚动锁定在会话容器内。
- **虚拟键盘交互适配**：配置 `interactive-widget=resizes-content`，键盘弹出时自动重塑视口高度。
- **防止输入框自动放大**：移动端输入框保持 `16px` 字号，防止 iOS/Android 聚焦缩放。

## 安装方式

添加至 DSH 配置文件（`~/.dsh/profiles/web/package.json`）：

```json
{
  "dependencies": {
    "dsh-mobile": "^1.0.0"
  },
  "dsh": {
    "profile": {
      "bundles": [
        "dsh-mobile"
      ]
    }
  }
}
```

或在 `cordis.patch.yml` 中配置：

```yaml
- id: dsh-mobile
  name: dsh-mobile
```

## 许可证

MIT © Maxwell Dalboni
