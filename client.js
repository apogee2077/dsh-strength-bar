window.__ModuleLoader__.load({
  id: '@local/dsh-strength-bar',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } = React;

    const NS = 'strength-bar';
    // Visible in the settings view and the trigger tooltip, so the running module
    // can be identified at a glance.
    const VERSION = '1.0.1';
    // Track and knob geometry. The knob is a perfect circle and the track caps are
    // true half-circles whose radius equals half the track thickness, so the knob
    // sits exactly on top of a cap at either end instead of overhanging it.
    const TRACK = 40;
    const CAP = TRACK / 2;
    const THUMB = 42;

    const ZH = {
      'tab.model': '模型',
      'tab.effort': '思考',
      'tab.mode': '模式',
      'label.effort': '思考强度',
      'label.model': '模型',
      'label.mode': 'Agent 预设',
      'label.switch': '切换控制对象',
      'trigger.title': '调整模型、思考强度与模式',
      'subtitle.model': '模型',
      'subtitle.effort': '思考强度',
      'subtitle.mode': 'Agent 预设',
      'subtitle.default': '新任务默认',
      'subtitle.current': '当前任务模式',
      'hint.nextTask': '新任务生效',
      'hint.locked': '已锁定',
      'hint.savedDefault': '已保存为新任务默认，从下一个新任务开始生效',
      'reset': '恢复默认',
      'loading': '加载中…',
      'unavailable': '暂不可用',
      'empty.models': '没有可用模型',
      'empty.efforts': '该模型没有思考强度选项',
      'empty.modes': '没有可用模式',
      'provider.account': 'DeepSeek 账户',
      'preset.standard': '标准模式',
      'preset.cordis': '创造模式',
      'preset.ptc': 'PTC 模式',
      'preset.minimal': '极简模式',
      'error': '切换失败：{message}',
      'aria.slider': '{label}滑杆，共 {count} 档',
      'mode.blank': '当前空白会话，选择后立即生效',
      'mode.active': '已有会话不能换模式，选择会保存为新任务默认',
      'mode.lockedHint': '当前任务模式已锁定，只能修改显示名称与顺序',
      'settings.title': '设置',
      'settings.subtitle': '调整顺序与显示名称',
      'settings.reset': '恢复默认',
      'settings.confirmReset': '确认恢复？',
      'settings.resetDone': '已恢复默认名称与顺序',
      'settings.orderUp': '上移',
      'settings.orderDown': '下移',
      'settings.namePlaceholder': '自定义显示名称',
      'settings.note': '自定义只影响弹窗和胶囊的显示，不会改动 DSH 的模型、强度或模式。',
      'settings.empty': '没有可调整的项',
      'settings.back': '返回',
      'settings.open': '设置',
      'settings.original': '原名',
    };

    const EN = {
      'tab.model': 'Model',
      'tab.effort': 'Think',
      'tab.mode': 'Mode',
      'label.effort': 'Reasoning effort',
      'label.model': 'Model',
      'label.mode': 'Agent preset',
      'label.switch': 'Switch control target',
      'trigger.title': 'Adjust model, reasoning effort and mode',
      'subtitle.model': 'Model',
      'subtitle.effort': 'Reasoning effort',
      'subtitle.mode': 'Agent preset',
      'subtitle.default': 'New-task default',
      'subtitle.current': 'Current task mode',
      'hint.nextTask': 'next task',
      'hint.locked': 'Locked',
      'hint.savedDefault': 'Saved as the new-task default; it applies from the next new task.',
      'reset': 'Reset to default',
      'loading': 'Loading…',
      'unavailable': 'Unavailable',
      'empty.models': 'No models available',
      'empty.efforts': 'This model exposes no reasoning effort',
      'empty.modes': 'No presets available',
      'provider.account': 'DeepSeek account',
      'preset.standard': 'Standard',
      'preset.cordis': 'Creator',
      'preset.ptc': 'PTC',
      'preset.minimal': 'Minimal',
      'error': 'Could not switch: {message}',
      'aria.slider': '{label} slider, {count} levels',
      'mode.blank': 'Blank session: the choice applies immediately',
      'mode.active': 'A running session keeps its preset; the choice becomes the new-task default',
      'mode.lockedHint': 'The current task mode is locked; only its display name and order can be changed',
      'settings.title': 'Settings',
      'settings.subtitle': 'Reorder and rename options',
      'settings.reset': 'Reset defaults',
      'settings.confirmReset': 'Confirm reset?',
      'settings.resetDone': 'Default names and order restored',
      'settings.orderUp': 'Move up',
      'settings.orderDown': 'Move down',
      'settings.namePlaceholder': 'Custom display name',
      'settings.note': 'Renames and order only affect this popover and the capsule; DSH model, effort and mode stay unchanged.',
      'settings.empty': 'Nothing to configure',
      'settings.back': 'Back',
      'settings.open': 'Settings',
      'settings.original': 'Original',
    };

    const EMPTY_STATE = Object.freeze({
      current: null,
      routable: null,
      groups: [],
      failures: [],
      status: 'idle',
      pending: null,
      error: null,
      retainedEffort: undefined,
    });

    const STARS = [
      { x: 6, y: 38, s: 3.0, d: 0.0, t: 2.6 },
      { x: 12, y: 64, s: 2.0, d: 0.7, t: 3.1 },
      { x: 18, y: 30, s: 2.6, d: 1.2, t: 2.4 },
      { x: 24, y: 72, s: 1.8, d: 0.3, t: 3.4 },
      { x: 30, y: 46, s: 2.2, d: 1.6, t: 2.9 },
      { x: 35, y: 26, s: 1.6, d: 0.9, t: 3.7 },
      { x: 41, y: 66, s: 2.8, d: 2.0, t: 2.5 },
      { x: 47, y: 40, s: 1.7, d: 1.1, t: 3.2 },
      { x: 53, y: 74, s: 2.1, d: 0.5, t: 2.8 },
      { x: 58, y: 32, s: 2.4, d: 1.9, t: 3.5 },
      { x: 63, y: 58, s: 1.5, d: 0.2, t: 3.0 },
      { x: 69, y: 36, s: 2.0, d: 1.4, t: 2.6 },
      { x: 74, y: 68, s: 2.7, d: 0.8, t: 3.3 },
      { x: 80, y: 44, s: 1.6, d: 2.2, t: 2.7 },
      { x: 85, y: 28, s: 2.2, d: 1.0, t: 3.6 },
      { x: 89, y: 60, s: 1.9, d: 0.4, t: 2.9 },
      { x: 94, y: 38, s: 2.5, d: 1.7, t: 2.4 },
      { x: 97, y: 72, s: 1.7, d: 2.4, t: 3.2 },
    ];

    const CSS = `
.dsb-anchor {
  --dsb-r: 0;
  --dsb-violet: #5b2be0;
  --dsb-violet-soft: #8b6ff5;
  --dsb-b: calc((1 - var(--dsb-r) * var(--dsb-r) * var(--dsb-r)) * 100%);
  position: relative;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  font-family: var(--dsw-font-family, inherit);
}
.dsb-trigger {
  --dsb-violet: #5b2be0;
  --dsb-violet-soft: #8b6ff5;
  --dsb-b: calc((1 - var(--dsb-r) * var(--dsb-r) * var(--dsb-r)) * 100%);
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex: none;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  border: .5px solid transparent;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent);
  color: var(--dsw-alias-label-secondary);
  font-family: inherit;
  font-size: 12.5px;
  line-height: 18px;
  font-weight: 450;
  white-space: nowrap;
  cursor: pointer;
  transition: background .16s ease, border-color .16s ease, color .16s ease;
}
.dsb-trigger:hover {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 8.5%, transparent);
  color: var(--dsw-alias-label-primary);
}
.dsb-trigger:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f7cff);
  outline-offset: 1px;
}
.dsb-trigger[aria-expanded="true"] {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
  border-color: var(--dsw-alias-border-l1, rgba(0,0,0,.1));
  color: var(--dsw-alias-label-primary);
}
.dsb-trigger[data-max="true"] {
  background: color-mix(in srgb, var(--dsb-violet) 10%, transparent);
  border-color: color-mix(in srgb, var(--dsb-violet) 34%, transparent);
  box-shadow:
    0 0 0 .5px rgba(124,58,237,.4),
    0 0 14px 1px rgba(124,58,237,.32),
    0 0 26px 5px rgba(168,85,247,.18);
  animation: dsb-trigger-glow 2.8s ease-in-out infinite;
}
.dsb-trigger[data-max="true"] .dsb-trigger-icon {
  color: var(--dsb-violet);
  filter: drop-shadow(0 0 5px rgba(124,58,237,.6));
}
.dsb-trigger[data-max="true"] .dsb-trigger-icon svg path { fill: currentColor; }
.dsb-trigger-icon { flex: none; display: grid; place-items: center; color: var(--dsw-alias-label-tertiary); }
.dsb-trigger-icon svg { width: 14px; height: 14px; display: block; }
.dsb-trigger-model { flex: none; color: var(--dsw-alias-label-primary); font-weight: 500; }
.dsb-trigger-sep { flex: none; color: var(--dsw-alias-label-tertiary); opacity: .7; }
.dsb-trigger-effort {
  flex: none;
  color: color-mix(in oklab, #3f7cf6 var(--dsb-b), #7c3aed);
  font-weight: 600;
}
.dsb-trigger-chev { flex: none; display: grid; place-items: center; color: var(--dsw-alias-label-tertiary); transition: transform .18s ease; }
.dsb-trigger[aria-expanded="true"] .dsb-trigger-chev { transform: rotate(180deg); }
.dsb-popover {
  position: absolute;
  left: calc(50% + var(--dsb-shift, 0px));
  margin-left: calc(0px - var(--dsb-half, 200px));
  bottom: calc(100% + 8px);
  width: 400px;
  max-width: calc(100vw - 24px);
  z-index: 60;
  pointer-events: auto;
  animation: dsb-rise .18s cubic-bezier(.22,1,.36,1) both;
}
.dsb-card {
  position: relative;
  box-sizing: border-box;
  border-radius: 24px;
  padding: 14px 16px 12px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1, #fff) 90%, transparent);
  backdrop-filter: blur(24px) saturate(1.08);
  -webkit-backdrop-filter: blur(24px) saturate(1.08);
  border: .5px solid var(--dsw-alias-border-l1, rgba(0,0,0,.07));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.5),
    0 18px 50px -18px rgba(20,14,60,.48),
    0 2px 10px rgba(20,14,60,.08);
  transition: border-color .3s ease, box-shadow .3s ease;
}
.dsb-card[data-max="true"] {
  border-color: color-mix(in srgb, var(--dsb-violet) 24%, var(--dsw-alias-border-l1, transparent));
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.55),
    0 18px 54px -18px rgba(92,44,235,.5),
    0 2px 10px rgba(20,14,60,.08);
}
.dsb-head {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 30px;
  align-items: start;
  gap: 4px;
}
.dsb-slot {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  color: var(--dsw-alias-label-tertiary);
}
.dsb-slot svg { width: 18px; height: 18px; display: block; }
.dsb-reset {
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  transition: background .16s ease, color .16s ease, transform .3s ease;
}
.dsb-reset:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.05));
  color: var(--dsw-alias-label-primary);
}
.dsb-reset:active { transform: rotate(-80deg); }
.dsb-reset:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #4f7cff); outline-offset: 2px; }
.dsb-reset:disabled { opacity: .35; cursor: default; }
.dsb-titles { text-align: center; min-width: 0; padding-top: 0; animation: dsb-swap .22s ease both; }
.dsb-title {
  font-size: 24px;
  line-height: 30px;
  font-weight: 500;
  letter-spacing: -.012em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: color-mix(in oklab, #3f7cf6 var(--dsb-b), #7c3aed);
  transition: color .25s ease;
}
.dsb-title[data-long="true"] { font-size: 21px; line-height: 30px; }
.dsb-title[data-max="true"] {
  background: linear-gradient(92deg, #7c3aed 0%, #a855f7 38%, #d946ef 72%, #8b5cf6 100%);
  background-size: 220% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: dsb-shimmer 4.5s linear infinite;
}
.dsb-card[data-view="settings"] .dsb-title,
.dsb-card[data-view="settings"] .dsb-subtext {
  color: var(--dsw-alias-label-primary);
  background: none;
  -webkit-background-clip: border-box;
  background-clip: border-box;
  animation: none;
}
.dsb-card[data-view="settings"] .dsb-subtext { color: var(--dsw-alias-label-secondary); }
.dsb-sub {
  margin-top: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  max-width: 100%;
  font-size: 13px;
  line-height: 18px;
  font-weight: 450;
  color: var(--dsw-alias-label-secondary);
  white-space: nowrap;
}
.dsb-sub[role="button"] { cursor: pointer; border-radius: 6px; }
.dsb-sub[role="button"]:hover .dsb-subtext { color: var(--dsb-violet); }
.dsb-sub[role="button"]:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f7cff);
  outline-offset: 2px;
}
.dsb-subtext {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  color: color-mix(in oklab, var(--dsw-alias-label-secondary) calc((1 - var(--dsb-r)) * 100%), var(--dsb-violet-soft));
  transition: color .25s ease;
}
.dsb-chev { opacity: .55; font-size: 15px; line-height: 1; transform: translateY(-.5px); }
.dsb-chip {
  display: inline-flex;
  align-items: center;
  flex: none;
  border-radius: 999px;
  padding: 0 7px;
  font-size: 11px;
  line-height: 17px;
  font-weight: 500;
  color: var(--dsb-violet);
  background: color-mix(in srgb, var(--dsb-violet) 11%, transparent);
}
.dsb-slider {
  position: relative;
  height: 52px;
  margin-top: 6px;
  touch-action: none;
  cursor: pointer;
  border-radius: ${CAP}px;
}
.dsb-slider:focus { outline: none; }
.dsb-slider:focus-visible .dsb-track {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f7cff);
  outline-offset: 3px;
}
.dsb-track {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: ${TRACK}px;
  margin-top: -${CAP}px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 10%, transparent);
  clip-path: inset(0 round 999px);
  transition: box-shadow .3s ease;
}
.dsb-fill {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  /* Ends exactly under the knob: pct + knob offset + knob radius. */
  width: calc(var(--dsb-pct) + var(--dsb-off) + ${THUMB / 2}px);
  clip-path: inset(0 round 999px);
  background: linear-gradient(
    90deg,
    color-mix(in oklab, #5b9bf8 var(--dsb-b), #a855f7) 0%,
    color-mix(in oklab, #3b82f6 var(--dsb-b), #7c3aed) 55%,
    color-mix(in oklab, #2563eb var(--dsb-b), #d946ef) 100%
  );
  transition: width .3s cubic-bezier(.22,1,.36,1);
}
.dsb-fill::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    rgba(56,189,248,.38) 0%,
    transparent 34%,
    rgba(168,85,247,.36) 64%,
    rgba(236,72,153,.42) 100%
  );
  opacity: calc(var(--dsb-r) * .9);
  transition: opacity .3s ease;
}
.dsb-fill::after {
  content: "";
  position: absolute;
  inset: 0;
  background: transparent;
}
.dsb-card[data-max="true"] .dsb-fill::after {
  background: linear-gradient(105deg, transparent 28%, rgba(255,255,255,.46) 48%, transparent 68%);
  background-size: 220% 100%;
  animation: dsb-sweep 3.6s linear infinite;
}
.dsb-card[data-max="true"] .dsb-track {
  box-shadow: inset 0 1px 2px rgba(0,0,0,.06), 0 0 0 .5px rgba(124,80,255,.45), 0 0 20px 2px rgba(98,44,245,.42);
  animation: dsb-glow 2.8s ease-in-out infinite;
}
.dsb-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: calc(max(0, var(--dsb-r) - 0.78) * 4.5);
  transition: opacity .3s ease;
}
.dsb-dots {
  position: absolute;
  left: ${CAP}px;
  right: ${CAP}px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
  opacity: calc(1 - var(--dsb-r) * var(--dsb-r) * var(--dsb-r));
  transition: opacity .25s ease;
}
.dsb-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 32%, transparent);
}
.dsb-dot[data-passed="true"] { background: rgba(255,255,255,.92); }
.dsb-star {
  position: absolute;
  width: var(--s);
  height: var(--s);
  margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
  background: #fff;
  box-shadow: 0 0 4px rgba(255,255,255,.95), 0 0 9px rgba(210,190,255,.65);
  animation: dsb-twinkle var(--t) ease-in-out infinite;
  animation-delay: var(--d);
}
.dsb-thumb {
  position: absolute;
  top: 50%;
  left: calc(var(--dsb-pct) + var(--dsb-off));
  width: ${THUMB}px;
  height: ${THUMB}px;
  aspect-ratio: 1 / 1;
  margin: -${THUMB / 2}px 0 0 -${THUMB / 2}px;
  /* The visible knob is the SVG circle inside; the element itself stays
     transparent so no stylesheet border-radius can turn it into a square. */
  border-radius: 50%;
  background: none;
  filter: drop-shadow(0 2px 4px rgba(18,14,45,.28));
  pointer-events: none;
  transition:
    left .3s cubic-bezier(.22,1,.36,1),
    filter .25s ease,
    transform .25s ease;
}
.dsb-card[data-max="true"] .dsb-thumb {
  filter:
    drop-shadow(0 2px 4px rgba(18,14,45,.28))
    drop-shadow(0 0 7px rgba(160,110,255,.45));
}
.dsb-anchor[data-dragging="true"] .dsb-fill,
.dsb-anchor[data-dragging="true"] .dsb-thumb { transition: none; }
.dsb-burst { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.dsb-burst i {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 8px rgba(150,110,255,.9);
  animation: dsb-pop .92s cubic-bezier(.16,.8,.3,1) forwards;
  opacity: 0;
}
.dsb-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
  margin-top: 10px;
  padding: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 5%, transparent);
}
.dsb-tab {
  appearance: none;
  border: 0;
  border-radius: 999px;
  padding: 4px 0 5px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12.5px;
  line-height: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: background .18s ease, color .18s ease, box-shadow .18s ease;
}
.dsb-tab:hover { color: var(--dsw-alias-label-primary); }
.dsb-tab[aria-selected="true"] {
  background: var(--dsw-alias-bg-layer-1, #fff);
  color: var(--dsw-alias-label-primary);
  box-shadow: 0 1px 3px rgba(22,18,48,.12), 0 0 0 .5px rgba(22,18,48,.04);
}
.dsb-tab:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f7cff);
  outline-offset: 1px;
}
.dsb-note {
  margin: 6px 6px 0;
  text-align: center;
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary);
}
.dsb-note[data-error="true"] { color: var(--dsw-alias-state-error-primary); }
.dsb-empty {
  padding: 14px 0 10px;
  text-align: center;
  font-size: 13px;
  color: var(--dsw-alias-label-tertiary);
}
.dsb-back-btn, .dsb-settings-btn {
  border: 0;
  background: transparent;
  padding: 0;
  border-radius: 8px;
  cursor: pointer;
  transition: background .16s ease, color .16s ease;
}
.dsb-back-btn:hover, .dsb-settings-btn:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.05));
  color: var(--dsw-alias-label-primary);
}
.dsb-back-btn:focus-visible, .dsb-settings-btn:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f7cff);
  outline-offset: 1px;
}
.dsb-card[data-max="true"] .dsb-settings-btn { color: var(--dsb-violet); }
.dsb-card[data-max="true"] .dsb-settings-btn svg path { fill: currentColor; }
.dsb-card[data-max="true"] .dsb-settings-btn svg { filter: drop-shadow(0 0 5px rgba(124,58,237,.55)); }
.dsb-settings {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 7px;
  max-height: 230px;
  overflow-y: auto;
  padding-right: 2px;
}
.dsb-settings::-webkit-scrollbar { width: 5px; }
.dsb-settings::-webkit-scrollbar-thumb {
  background: var(--dsw-alias-scrollbar-bg-l2, rgba(0,0,0,.15));
  border-radius: 999px;
}
.dsb-row {
  border: .5px solid var(--dsw-alias-border-l1);
  border-radius: 12px;
  padding: 6px 7px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: color-mix(in srgb, var(--dsw-alias-bg-layer-1) 55%, transparent);
}
.dsb-row-head { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dsb-row-original {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  line-height: 15px;
  color: var(--dsw-alias-label-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsb-row-actions { display: flex; gap: 2px; flex: none; }
.dsb-mini {
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.dsb-mini:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.dsb-mini:disabled { opacity: .28; cursor: default; }
.dsb-name-input {
  box-sizing: border-box;
  width: 100%;
  height: 24px;
  border: .5px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  line-height: 18px;
  padding: 0 8px;
}
.dsb-name-input::placeholder { color: var(--dsw-alias-label-tertiary); }
.dsb-name-input:focus {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f7cff);
  outline-offset: 1px;
  border-color: transparent;
}
.dsb-settings-footer { display: flex; justify-content: flex-end; margin-top: 2px; }
.dsb-reset-all {
  height: 26px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);
  color: var(--dsw-alias-label-secondary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background .16s ease, color .16s ease;
}
.dsb-reset-all:hover {
  background: color-mix(in srgb, var(--dsw-alias-label-primary) 11%, transparent);
  color: var(--dsw-alias-label-primary);
}
.dsb-reset-all:disabled { opacity: .35; cursor: default; }
.dsb-card[data-view="settings"] .dsb-note { text-align: left; }
@keyframes dsb-trigger-glow {
  0%, 100% { box-shadow: 0 0 0 .5px rgba(124,58,237,.35), 0 0 10px 1px rgba(124,58,237,.25); }
  50% { box-shadow: 0 0 0 .5px rgba(124,58,237,.55), 0 0 18px 3px rgba(168,85,247,.42); }
}
@keyframes dsb-sweep {
  from { background-position: 140% 0; }
  to { background-position: -40% 0; }
}
@keyframes dsb-swap {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: none; }
}
@keyframes dsb-rise {
  from { opacity: 0; transform: translateY(7px) scale(.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes dsb-twinkle {
  0%, 100% { opacity: .45; transform: scale(.85); }
  50% { opacity: 1; transform: scale(1.12); }
}
@keyframes dsb-glow {
  0%, 100% { box-shadow: 0 0 0 .5px rgba(124,80,255,.35), 0 0 14px 1px rgba(98,44,245,.32); }
  50% { box-shadow: 0 0 0 .5px rgba(124,80,255,.55), 0 0 24px 4px rgba(98,44,245,.52); }
}
@keyframes dsb-shimmer {
  from { background-position: 0% 50%; }
  to { background-position: 200% 50%; }
}
@keyframes dsb-pop {
  0% { opacity: 0; transform: translate(0, 0) scale(.4); }
  22% { opacity: 1; }
  100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.2); }
}
@media (prefers-reduced-motion: reduce) {
  .dsb-star, .dsb-card[data-max="true"] .dsb-track, .dsb-title[data-max="true"], .dsb-burst i,
  .dsb-card[data-max="true"] .dsb-fill::after, .dsb-trigger, .dsb-popover {
    animation: none !important;
  }
  .dsb-fill, .dsb-thumb, .dsb-card, .dsb-title, .dsb-subtext, .dsb-dots, .dsb-fill::before {
    transition: none !important;
  }
}
`;

    function BoltIcon() {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
        },
        h('path', { d: 'M13 2.5 4.8 13.4h5.7l-1 8.1 8.7-11.2h-5.9l.7-7.8Z' }),
      );
    }

    function ResetIcon() {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
        },
        h('path', { d: 'M3.2 12a8.8 8.8 0 1 0 2.9-6.55L3 8.2' }),
        h('path', { d: 'M3 3.2v5h5' }),
      );
    }

    function BackIcon() {
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.8,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': 'true',
        },
        h('path', { d: 'm15 18-6-6 6-6' }),
      );
    }

    function clamp(value, min, max) {
      return value < min ? min : value > max ? max : value;
    }

    function messageOf(error) {
      if (error === null || error === undefined) return 'unknown error';
      if (typeof error === 'string') return error;
      if (typeof error.message === 'string') return error.message;
      return String(error);
    }

    function indexOfSelection(list, selection) {
      if (!selection) return -1;
      return list.findIndex((item) => item.provider === selection.provider && item.model === selection.model);
    }

    const POPOVER_ID = 'dsh-strength-popover';
    const SETTINGS_KEY = 'dsh-strength-bar:settings:v1';
    const CUSTOM_KINDS = ['model', 'effort', 'mode'];

    function loadCustomSettings() {
      try {
        const raw = window.localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { names: {}, order: {} };
        const parsed = JSON.parse(raw);
        const names = {};
        if (parsed && parsed.names && typeof parsed.names === 'object') {
          for (const [key, value] of Object.entries(parsed.names)) {
            if (typeof value === 'string' && value.trim()) names[key] = value.trim().slice(0, 60);
          }
        }
        const order = {};
        if (parsed && parsed.order && typeof parsed.order === 'object') {
          for (const kind of CUSTOM_KINDS) {
            const list = parsed.order[kind];
            if (Array.isArray(list)) order[kind] = list.filter((entry) => typeof entry === 'string');
          }
        }
        return { names, order };
      } catch {
        return { names: {}, order: {} };
      }
    }

    function saveCustomSettings(next) {
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {}
    }

    function customNameOf(custom, kind, key, fallback) {
      const value = custom && custom.names ? custom.names[`${kind}:${key}`] : undefined;
      return value || fallback;
    }

    function mergedOrder(keys, existing) {
      const known = new Set(keys);
      const result = Array.isArray(existing) ? existing.filter((key) => known.has(key)) : [];
      for (const key of keys) if (!result.includes(key)) result.push(key);
      return result;
    }

    function orderItems(items, existing, keyOf) {
      if (!Array.isArray(existing) || existing.length === 0) return items;
      const rank = new Map(existing.map((key, index) => [key, index]));
      return items
        .map((item, index) => ({ item, index }))
        .sort((left, right) => {
          const leftRank = rank.has(keyOf(left.item)) ? rank.get(keyOf(left.item)) : Number.MAX_SAFE_INTEGER;
          const rightRank = rank.has(keyOf(right.item)) ? rank.get(keyOf(right.item)) : Number.MAX_SAFE_INTEGER;
          return leftRank === rightRank ? left.index - right.index : leftRank - rightRank;
        })
        .map((entry) => entry.item);
    }


    function StrengthControl(props) {
      const { t, models, remote, sessionId, useSession, useProjection } = props;
      const blank = useSession((snapshot) => (snapshot ? snapshot.blank === true : false)) ?? false;
      const sessionPreset =
        useSession((snapshot) => {
          const values = snapshot && snapshot.projectionValues;
          return values && typeof values.agentPreset === 'string' ? values.agentPreset : null;
        }) ?? null;
      const projectedPreset = useProjection('agentPreset');
      const currentPreset =
        (typeof projectedPreset === 'string'
          ? projectedPreset
          : projectedPreset && typeof projectedPreset.id === 'string'
            ? projectedPreset.id
            : null) || sessionPreset;

      let directory = null;
      try {
        directory = models.directoryFor(sessionId);
      } catch {
        directory = null;
      }

      const subscribe = useCallback(
        (listener) => (directory ? directory.store.subscribe(listener) : () => {}),
        [directory],
      );
      const getSnapshot = useCallback(
        () => (directory ? directory.store.getSnapshot() : EMPTY_STATE),
        [directory],
      );
      const state = useSyncExternalStore(subscribe, getSnapshot);

      const [dimension, setDimension] = useState('effort');
      const [open, setOpen] = useState(false);
      const [popoverHalf, setPopoverHalf] = useState(200);
      const [popoverShift, setPopoverShift] = useState(0);
      const [drag, setDrag] = useState(null);
      const [burst, setBurst] = useState(0);
      const [note, setNote] = useState(null);
      const [roster, setRoster] = useState({ status: 'idle', presets: [], error: null });
      const [defaultOverride, setDefaultOverride] = useState(null);
      const [catalogDefault, setCatalogDefault] = useState(null);
      const [modePending, setModePending] = useState(null);
      const [custom, setCustom] = useState(loadCustomSettings);
      const [view, setView] = useState('control');
      const [resetArmed, setResetArmed] = useState(false);

      const trackRef = useRef(null);
      const dragRef = useRef(null);
      const rootRef = useRef(null);
      const tabRefs = useRef({});
      const noteTimer = useRef(null);

      const notify = useCallback(
        (text, isError) => {
          setNote({ text, error: !!isError });
          if (noteTimer.current) clearTimeout(noteTimer.current);
          noteTimer.current = setTimeout(() => setNote(null), isError ? 6000 : 4200);
        },
        [],
      );

      useEffect(() => () => {
        if (noteTimer.current) clearTimeout(noteTimer.current);
      }, []);

      const commitCustom = useCallback((mutator) => {
        setCustom((current) => {
          const next = { names: { ...current.names }, order: { ...current.order } };
          mutator(next);
          saveCustomSettings(next);
          return next;
        });
      }, []);

      const setCustomName = useCallback(
        (kind, key, value) => {
          const prefix = `${kind}:${key}`;
          commitCustom((next) => {
            const trimmed = value.trim();
            if (trimmed) next.names[prefix] = trimmed.slice(0, 60);
            else delete next.names[prefix];
          });
        },
        [commitCustom],
      );

      const moveOption = useCallback(
        (kind, key, delta, keys) => {
          commitCustom((next) => {
            const order = mergedOrder(keys, next.order[kind]);
            const at = order.indexOf(key);
            const target = at + delta;
            if (at < 0 || target < 0 || target >= order.length) return;
            const copy = order.slice();
            const [moved] = copy.splice(at, 1);
            copy.splice(target, 0, moved);
            next.order[kind] = copy;
          });
        },
        [commitCustom],
      );

      useEffect(() => {
        if (!resetArmed) return;
        const timer = setTimeout(() => setResetArmed(false), 3200);
        return () => clearTimeout(timer);
      }, [resetArmed]);

      // Load the shared model catalog for this session once per directory.
      useEffect(() => {
        if (!directory) return;
        directory.load().catch(() => {});
      }, [directory]);

      // The catalog default is only needed by the reset action.
      useEffect(() => {
        let alive = true;
        remote.session.modelCatalog().then(
          (response) => {
            if (!alive) return;
            if (response && response.ok && response.value && response.value.default) {
              setCatalogDefault(response.value.default);
            }
          },
          () => {},
        );
        return () => {
          alive = false;
        };
      }, [remote]);

      const readRoster = useCallback(() => {
        setRoster((current) => ({ ...current, status: 'loading', error: null }));
        remote.agentPresets.list().then(
          (response) => {
            if (!response || !response.ok) {
              const error = response && response.error ? messageOf(response.error) : 'agent presets unavailable';
              setRoster({ status: 'error', presets: [], error });
              return;
            }
            const presets = Array.isArray(response.value && response.value.presets) ? response.value.presets : [];
            setRoster({ status: 'ready', presets, error: null });
          },
          (error) => setRoster({ status: 'error', presets: [], error: messageOf(error) }),
        );
      }, [remote]);

      useEffect(() => {
        readRoster();
      }, [readRoster]);

      const groups = useMemo(() => {
        const raw = Array.isArray(state.groups) ? state.groups : [];
        const first = (id) => (id === 'deepseek-account' ? 0 : id === 'deepseek-official' ? 1 : 2);
        return raw
          .map((group) => ({
            ...group,
            displayName: group.id === 'deepseek-account' ? t('provider.account') : group.name || group.id,
          }))
          .slice()
          .sort((a, b) => first(a.id) - first(b.id));
      }, [state.groups, t]);

      const modelItems = useMemo(() => {
        const raw = groups.flatMap((group) =>
          (Array.isArray(group.models) ? group.models : []).map((model) => ({
            provider: group.id,
            model: model.id,
            group,
            meta: model,
            key: `${group.id}/${model.id}`,
            originalName: model.name || model.id,
          })),
        );
        return orderItems(raw, custom.order.model, (item) => item.key).map((item) => ({
          ...item,
          displayName: customNameOf(custom, 'model', item.key, item.originalName),
        }));
      }, [groups, custom]);

      const effectiveSelection = state.pending || state.current || null;
      const currentModelItem =
        effectiveSelection === null
          ? null
          : modelItems.find((item) => item.provider === effectiveSelection.provider && item.model === effectiveSelection.model) || null;

      const effortItems = useMemo(() => {
        const reasoning = currentModelItem && currentModelItem.meta ? currentModelItem.meta.reasoning : null;
        const efforts = reasoning && Array.isArray(reasoning.efforts) ? reasoning.efforts : [];
        const raw = efforts.map((effort) => ({
          id: effort.id,
          name: effort.name || effort.id,
          originalName: effort.name || effort.id,
          description: effort.description,
          key: effort.id,
        }));
        return orderItems(raw, custom.order.effort, (item) => item.id).map((item) => ({
          ...item,
          displayName: customNameOf(custom, 'effort', item.id, item.originalName),
        }));
      }, [currentModelItem, custom]);

      const healthyPresets = useMemo(
        () => roster.presets.filter((preset) => preset && preset.broken === undefined && typeof preset.id === 'string'),
        [roster.presets],
      );
      const modeItems = useMemo(() => {
        const builtinNames = {
          standard: t('preset.standard'),
          cordis: t('preset.cordis'),
          ptc: t('preset.ptc'),
          minimal: t('preset.minimal'),
        };
        const raw = healthyPresets.map((preset) => {
          const label = builtinNames[preset.id] || preset.name || preset.id;
          return {
            id: preset.id,
            name: label,
            originalName: label,
            description: preset.description,
            isDefault: preset.isDefault === true,
            key: preset.id,
          };
        });
        return orderItems(raw, custom.order.mode, (item) => item.id).map((item) => ({
          ...item,
          displayName: customNameOf(custom, 'mode', item.id, item.originalName),
        }));
      }, [healthyPresets, custom, t]);

      const rosterDefaultId = useMemo(() => {
        const found = healthyPresets.find((preset) => preset.isDefault === true);
        return found ? found.id : healthyPresets.length > 0 ? healthyPresets[0].id : null;
      }, [healthyPresets]);

      const defaultModeId = defaultOverride || rosterDefaultId;

      const modeValueId = currentPreset || defaultModeId;
      const modeValueIndex = modeItems.findIndex((item) => item.id === modeValueId);

      // A blank-session preset switch is applied by recomposing the Session; keep
      // the chosen tier on screen until the durable projection catches up.
      useEffect(() => {
        if (modePending === null) return;
        if (blank && currentPreset === modePending) {
          setModePending(null);
          return;
        }
        const timer = setTimeout(() => setModePending(null), 6000);
        return () => clearTimeout(timer);
      }, [modePending, blank, currentPreset]);

      // The popover belongs to one Session; never carry it across a session switch.
      const lastSessionId = useRef(sessionId);
      useEffect(() => {
        if (lastSessionId.current === sessionId) return;
        lastSessionId.current = sessionId;
        setOpen(false);
      }, [sessionId]);

      useEffect(() => {
        if (open) return;
        setView('control');
        setResetArmed(false);
      }, [open]);

      // The card centers on the capsule, but stays inside the viewport when the
      // capsule sits too close to an edge for the full 400px width.
      useLayoutEffect(() => {
        if (!open) {
          setPopoverShift(0);
          return;
        }
        const measure = () => {
          const root = rootRef.current;
          if (!root) return;
          const rect = root.getBoundingClientRect();
          const width = Math.min(400, window.innerWidth - 24);
          const center = rect.left + rect.width / 2;
          const min = width / 2 + 12;
          const max = window.innerWidth - width / 2 - 12;
          const clamped = Math.min(Math.max(center, min), max);
          setPopoverHalf(width / 2);
          setPopoverShift(clamped - center);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
      }, [open]);

      // Close on outside press or Escape; the capsule and card stay inside rootRef.
      useEffect(() => {
        if (!open) return;
        const onDocumentPointerDown = (event) => {
          const root = rootRef.current;
          if (!root) return;
          if (typeof Node !== 'undefined' && event.target instanceof Node && root.contains(event.target)) return;
          setOpen(false);
        };
        const onDocumentKeyDown = (event) => {
          if (event.key !== 'Escape') return;
          setOpen(false);
          const root = rootRef.current;
          const trigger = root && typeof root.querySelector === 'function' ? root.querySelector('.dsb-trigger') : null;
          if (trigger && typeof trigger.focus === 'function') trigger.focus();
        };
        document.addEventListener('mousedown', onDocumentPointerDown, true);
        document.addEventListener('keydown', onDocumentKeyDown);
        return () => {
          document.removeEventListener('mousedown', onDocumentPointerDown, true);
          document.removeEventListener('keydown', onDocumentKeyDown);
        };
      }, [open]);

      const modelIndex = indexOfSelection(modelItems, effectiveSelection);
      const effortValue =
        effectiveSelection && effectiveSelection.reasoningEffort
          ? effectiveSelection.reasoningEffort
          : currentModelItem && currentModelItem.meta && currentModelItem.meta.reasoning
            ? currentModelItem.meta.reasoning.defaultEffort
            : undefined;
      const effortIndex = effortItems.findIndex((item) => item.id === effortValue);

      const ready = state.status === 'ready' || state.status === 'selecting' || state.status === 'error';
      const loadingModels = state.status === 'loading' || state.status === 'idle';

      let items = [];
      let valueIndex = -1;
      let label = '';
      let title = '';
      let subtitle = '';
      let emptyText = '';
      let longTitle = false;

      if (dimension === 'model') {
        items = modelItems;
        valueIndex = modelIndex;
        label = t('label.model');
        title = loadingModels ? t('loading') : currentModelItem ? currentModelItem.displayName : t('unavailable');
        subtitle = currentModelItem ? currentModelItem.group.displayName : '';
        longTitle = title.length > 18;
        emptyText = t('empty.models');
      } else if (dimension === 'effort') {
        items = effortItems;
        valueIndex = effortIndex;
        label = t('label.effort');
        const effortName = effortIndex >= 0 ? effortItems[effortIndex].displayName : null;
        title = loadingModels ? t('loading') : effortName || t('empty.efforts');
        subtitle = currentModelItem ? currentModelItem.displayName : '';
        emptyText = t('empty.efforts');
        longTitle = title.length > 18;
      } else {
        items = modeItems;
        let resolvedIndex = modeValueIndex;
        if (modePending !== null) {
          const pendingIndex = modeItems.findIndex((item) => item.id === modePending);
          if (pendingIndex >= 0) resolvedIndex = pendingIndex;
        }
        valueIndex = resolvedIndex;
        label = t('label.mode');
        const value = valueIndex >= 0 ? modeItems[valueIndex] : null;
        title = roster.status === 'loading' ? t('loading') : value ? value.displayName : t('unavailable');
        subtitle = blank ? t('subtitle.mode') : t('subtitle.current');
        emptyText = t('empty.modes');
        longTitle = title.length > 18;
      }

      // Drag preview wins over committed state until the pointer is released.
      let shownIndex = valueIndex;
      if (drag !== null && drag.dimension === dimension) shownIndex = drag.index;
      if (shownIndex < 0 && items.length > 0) shownIndex = 0;

      const total = items.length;
      const snappedRatio = total <= 1 ? 0.5 : Math.max(0, shownIndex) / (total - 1);
      const visualRatio = drag !== null && drag.dimension === dimension ? drag.ratio : snappedRatio;

      // Geometry is part of the design, so it is re-derived from the nodes every
      // frame instead of trusting the stylesheets alone: some values arrive as
      // an inline rewrite that says nothing about their basis (a `%` knob radius
      // measures against the long edge, i.e. a rounded rectangle). Drawing the
      // knob, caps and ball corners from measured px sizes keeps them round and
      // keeps the fill's end caps exactly under the knob.
      useLayoutEffect(() => {
        if (!open) return;
        const root = rootRef.current;
        if (!root) return;
        // Track and fill: a stadium whose caps are half the rendered height, so
        // the fill always ends in a semicircle instead of a straight edge.
        const cap = (node) => {
          const box = node.getBoundingClientRect();
          if (box.width <= 0 || box.height <= 0) return;
          const radius = Math.max(0, Math.min(CAP, box.height / 2, box.width / 2));
          node.style.setProperty('border-radius', `${radius}px`, 'important');
        };
        for (const node of root.querySelectorAll('.dsb-track')) {
          cap(node);
          node.style.setProperty('overflow', 'hidden', 'important');
          node.style.setProperty('clip-path', 'inset(0 round 999px)', 'important');
        }
        for (const node of root.querySelectorAll('.dsb-fill')) {
          cap(node);
          node.style.setProperty('clip-path', 'inset(0 round 999px)', 'important');
        }
        // Knob and level dots are rendered as SVG circles, so their corner
        // radius is purely decorative; pin it anyway for old cached styles.
        for (const node of root.querySelectorAll('.dsb-thumb')) {
          cap(node);
          node.style.setProperty('background', 'transparent', 'important');
          node.style.setProperty('box-shadow', 'none', 'important');
        }
        for (const node of root.querySelectorAll('.dsb-star, .dsb-dot')) {
          const box = node.getBoundingClientRect();
          const side = Math.max(0, Math.min(box.width, box.height));
          if (side > 0) node.style.setProperty('border-radius', `${side / 2}px`, 'important');
        }
      }, [open, view, dimension, total, visualRatio]);

      const atMax = total > 1 && shownIndex === total - 1;
      const effectMax = atMax;
      const cardRatio = snappedRatio;
      const disabled =
        total === 0 ||
        (dimension !== 'mode' && !ready) ||
        (dimension === 'mode' && roster.status === 'loading') ||
        (dimension === 'mode' && !blank);

      // The label follows the finger while dragging; the committed state is the fallback.
      const activeItem = shownIndex >= 0 ? items[shownIndex] : null;
      let displayTitle = title;
      let displaySubtitle = subtitle;
      if (activeItem) {
        if (dimension === 'model') {
          displayTitle = activeItem.displayName;
          displaySubtitle = activeItem.group.displayName;
        } else {
          displayTitle = activeItem.displayName;
        }
      }
      const displayLong = displayTitle.length > 18;

      // The collapsed entry always reports the active model and its effort,
      // whichever dimension the popover is currently editing.
      const draggingModel = dimension === 'model' && drag !== null;
      const labelModelItem = draggingModel ? modelItems[shownIndex] : currentModelItem;
      const labelModel = labelModelItem
        ? labelModelItem.displayName
        : loadingModels
          ? t('loading')
          : t('unavailable');
      const draggingEffort = dimension === 'effort' && drag !== null;
      const labelEffortIndex = draggingEffort ? shownIndex : effortIndex;
      const labelEffort =
        labelEffortIndex >= 0 && effortItems[labelEffortIndex] ? effortItems[labelEffortIndex].displayName : '';
      const labelEffortRatio =
        effortItems.length <= 1 ? 0.5 : Math.max(0, labelEffortIndex) / (effortItems.length - 1);
      const labelAtMax = effortItems.length > 1 && labelEffortIndex === effortItems.length - 1;

      const prevMax = useRef(effectMax);
      useEffect(() => {
        if (effectMax && !prevMax.current) setBurst((value) => value + 1);
        prevMax.current = effectMax;
      }, [effectMax]);

      const ratioAt = useCallback(
        (clientX) => {
          const track = trackRef.current;
          if (!track || total <= 1) return 0;
          const rect = track.getBoundingClientRect();
          const usable = Math.max(1, rect.width - TRACK);
          const x = clamp(clientX - rect.left - CAP, 0, usable);
          return x / usable;
        },
        [total],
      );

      const indexAt = useCallback(
        (clientX) => {
          if (total <= 1) return 0;
          return Math.round(ratioAt(clientX) * (total - 1));
        },
        [ratioAt, total],
      );

      const selectMode = useCallback(
        (id) => {
          setModePending(id);
          if (blank) {
            remote.agentPresets.select(sessionId, id).then(
              (response) => {
                if (!response || !response.ok) {
                  setModePending(null);
                  notify(t('error', { message: response && response.error ? messageOf(response.error) : 'unknown error' }), true);
                }
              },
              (error) => {
                setModePending(null);
                notify(t('error', { message: messageOf(error) }), true);
              },
            );
            return;
          }
          remote.settings.update('agent-preset-registry', { selectedDefault: id }).then(
            (response) => {
              setModePending(null);
              if (!response || !response.ok) {
                notify(t('error', { message: response && response.error ? messageOf(response.error) : 'unknown error' }), true);
                return;
              }
              setDefaultOverride(id);
              notify(t('hint.savedDefault'));
              readRoster();
            },
            (error) => {
              setModePending(null);
              notify(t('error', { message: messageOf(error) }), true);
            },
          );
        },
        [blank, notify, readRoster, remote, sessionId, t],
      );

      const commit = useCallback(
        (index) => {
          if (index < 0 || index >= items.length) return;
          const item = items[index];
          if (dimension === 'model') {
            if (effectiveSelection && effectiveSelection.provider === item.provider && effectiveSelection.model === item.model) return;
            if (!directory) return;
            try {
              directory.select({ provider: item.provider, model: item.model }).then(
                (result) => {
                  if (result && !result.ok) {
                    notify(t('error', { message: result.error ? messageOf(result.error) : 'unknown error' }), true);
                  }
                },
                (error) => notify(t('error', { message: messageOf(error) }), true),
              );
            } catch (error) {
              notify(t('error', { message: messageOf(error) }), true);
            }
            return;
          }
          if (dimension === 'effort') {
            if (!effectiveSelection || !directory) return;
            if (item.id === effortValue) return;
            try {
              directory
                .select({
                  provider: effectiveSelection.provider,
                  model: effectiveSelection.model,
                  reasoningEffort: item.id,
                })
                .then(
                  (result) => {
                    if (result && !result.ok) {
                      notify(t('error', { message: result.error ? messageOf(result.error) : 'unknown error' }), true);
                    }
                  },
                  (error) => notify(t('error', { message: messageOf(error) }), true),
                );
            } catch (error) {
              notify(t('error', { message: messageOf(error) }), true);
            }
            return;
          }
          if (item.id === modeValueId && modePending === null) return;
          selectMode(item.id);
        },
        [dimension, directory, effectiveSelection, effortValue, items, modePending, modeValueId, notify, selectMode, t],
      );

      const onPointerDown = (event) => {
        if (disabled || event.button !== undefined && event.button !== 0) return;
        event.preventDefault();
        const index = indexAt(event.clientX);
        dragRef.current = { pointerId: event.pointerId, index };
        setDrag({ dimension, index, ratio: ratioAt(event.clientX) });
        if (typeof event.currentTarget.setPointerCapture === 'function') {
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {}
        }
        if (typeof event.currentTarget.focus === 'function') event.currentTarget.focus();
      };

      const onPointerMove = (event) => {
        if (!dragRef.current || dragRef.current.pointerId !== event.pointerId) return;
        const index = indexAt(event.clientX);
        if (index !== dragRef.current.index) {
          dragRef.current.index = index;
        }
        setDrag({ dimension, index, ratio: ratioAt(event.clientX) });
      };

      const endDrag = (event) => {
        if (!dragRef.current) return;
        const index = indexAt(event.clientX);
        dragRef.current = null;
        setDrag(null);
        if (typeof event.currentTarget.releasePointerCapture === 'function') {
          try {
            if (event.currentTarget.hasPointerCapture && event.currentTarget.hasPointerCapture(event.pointerId)) {
              event.currentTarget.releasePointerCapture(event.pointerId);
            }
          } catch {}
        }
        commit(index);
      };

      const onKeyDown = (event) => {
        if (disabled) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
          event.preventDefault();
          commit(clamp(shownIndex + 1, 0, total - 1));
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
          event.preventDefault();
          commit(clamp(shownIndex - 1, 0, total - 1));
        } else if (event.key === 'Home') {
          event.preventDefault();
          commit(0);
        } else if (event.key === 'End') {
          event.preventDefault();
          commit(total - 1);
        }
      };

      const reset = () => {
        if (disabled) return;
        if (dimension === 'model') {
          if (!directory) return;
          const target = catalogDefault || (modelItems[0] ? { provider: modelItems[0].provider, model: modelItems[0].model } : null);
          if (!target) return;
          try {
            directory.select({ provider: target.provider, model: target.model }).then(
              (result) => {
                if (result && !result.ok) {
                  notify(t('error', { message: result.error ? messageOf(result.error) : 'unknown error' }), true);
                }
              },
              (error) => notify(t('error', { message: messageOf(error) }), true),
            );
          } catch (error) {
            notify(t('error', { message: messageOf(error) }), true);
          }
          return;
        }
        if (dimension === 'effort') {
          if (!directory || !effectiveSelection) return;
          try {
            directory.select({ provider: effectiveSelection.provider, model: effectiveSelection.model }).then(
              (result) => {
                if (result && !result.ok) {
                  notify(t('error', { message: result.error ? messageOf(result.error) : 'unknown error' }), true);
                }
              },
              (error) => notify(t('error', { message: messageOf(error) }), true),
            );
          } catch (error) {
            notify(t('error', { message: messageOf(error) }), true);
          }
          return;
        }
        if (defaultModeId) selectMode(defaultModeId);
      };

      const switchDimension = (next) => {
        if (next === dimension) return;
        dragRef.current = null;
        setDrag(null);
        setDimension(next);
      };

      const ariaValueText = displayTitle;
      const style = {
        '--dsb-r': String(cardRatio),
        '--dsb-pct': `${visualRatio * 100}%`,
        '--dsb-off': `${CAP - TRACK * visualRatio}px`,
      };

      const stars = STARS.map((star, index) =>
        h('span', {
          key: index,
          className: 'dsb-star',
          style: {
            left: `${star.x}%`,
            top: `${star.y}%`,
            '--s': `${star.s}px`,
            '--d': `${star.d}s`,
            '--t': `${star.t}s`,
          },
        }),
      );

      const burstDots = [0, 1, 2, 3, 4, 5].map((index) =>
        h('i', {
          key: `${burst}-${index}`,
          style: {
            left: `${34 + index * 9}%`,
            top: `${30 + (index % 3) * 22}%`,
            '--dx': `${(index % 2 === 0 ? -1 : 1) * (14 + index * 5)}px`,
            '--dy': `${-18 - index * 5}px`,
            animationDelay: `${index * 0.045}s`,
          },
        }),
      );

      const tabs = [
        { id: 'model', label: t('tab.model') },
        { id: 'effort', label: t('tab.effort') },
        { id: 'mode', label: t('tab.mode') },
      ].map((tab) =>
        h(
          'button',
          {
            key: tab.id,
            type: 'button',
            role: 'tab',
            className: 'dsb-tab',
            ref: (node) => {
              tabRefs.current[tab.id] = node;
            },
            'aria-selected': tab.id === dimension ? 'true' : 'false',
            tabIndex: tab.id === dimension ? 0 : -1,
            onClick: () => switchDimension(tab.id),
            onKeyDown: (event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
                event.preventDefault();
                const order = ['model', 'effort', 'mode'];
                const at = order.indexOf(dimension);
                const delta = event.key === 'ArrowRight' ? 1 : -1;
                const next = order[(at + delta + order.length) % order.length];
                switchDimension(next);
                requestAnimationFrame(() => {
                  const node = tabRefs.current[next];
                  if (node && typeof node.focus === 'function') node.focus();
                });
              }
            },
          },
          tab.label,
        ),
      );

      const modeHint = dimension === 'mode' && !blank && roster.status === 'ready';
      const subtitleTarget = view === 'control' && dimension !== 'mode' ? (dimension === 'effort' ? 'model' : 'effort') : null;
      const modelError =
        (dimension === 'model' || dimension === 'effort') && state.status === 'error'
          ? typeof state.error === 'string'
            ? state.error
            : t('unavailable')
          : null;

      const settingsItems = dimension === 'model' ? modelItems : dimension === 'effort' ? effortItems : modeItems;
      const settingsKeys = settingsItems.map((item) => item.key);
      const hasCustom =
        Object.keys(custom.names).length > 0 ||
        CUSTOM_KINDS.some((kind) => Array.isArray(custom.order[kind]) && custom.order[kind].length > 0);

      const resetCustom = () => {
        if (!hasCustom) return;
        if (!resetArmed) {
          setResetArmed(true);
          return;
        }
        commitCustom((next) => {
          next.names = {};
          next.order = {};
        });
        setResetArmed(false);
        notify(t('settings.resetDone'));
      };

      const settingsRows = h(
        'div',
        { className: 'dsb-settings' },
        settingsItems.length === 0
          ? h('div', { className: 'dsb-empty' }, t('settings.empty'))
          : settingsItems.map((item, index) =>
              h(
                'div',
                { className: 'dsb-row', key: item.key },
                h(
                  'div',
                  { className: 'dsb-row-head' },
                  h('span', { className: 'dsb-row-original', title: item.originalName }, item.originalName),
                  h(
                    'div',
                    { className: 'dsb-row-actions' },
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dsb-mini',
                        disabled: index === 0,
                        title: t('settings.orderUp'),
                        'aria-label': t('settings.orderUp'),
                        onClick: () => moveOption(dimension, item.key, -1, settingsKeys),
                      },
                      '↑',
                    ),
                    h(
                      'button',
                      {
                        type: 'button',
                        className: 'dsb-mini',
                        disabled: index === settingsItems.length - 1,
                        title: t('settings.orderDown'),
                        'aria-label': t('settings.orderDown'),
                        onClick: () => moveOption(dimension, item.key, 1, settingsKeys),
                      },
                      '↓',
                    ),
                  ),
                ),
                h('input', {
                  type: 'text',
                  className: 'dsb-name-input',
                  value: custom.names[`${dimension}:${item.key}`] || '',
                  placeholder: t('settings.namePlaceholder'),
                  maxLength: 60,
                  spellCheck: false,
                  onChange: (event) => setCustomName(dimension, item.key, event.target.value),
                }),
              ),
            ),
      );

      const settingsFooter = h(
        'div',
        { className: 'dsb-settings-footer' },
        h(
          'button',
          {
            type: 'button',
            className: 'dsb-reset-all',
            disabled: !hasCustom,
            onClick: resetCustom,
          },
          resetArmed ? t('settings.confirmReset') : t('settings.reset'),
        ),
      );

      return h(
        React.Fragment,
        null,
        h('style', null, CSS),
        h(
          'span',
          {
            ref: rootRef,
            className: 'dsb-anchor',
            style,
            'data-dragging': drag !== null ? 'true' : 'false',
            'data-dimension': dimension,
          },
          h(
            'button',
            {
              type: 'button',
              className: 'dsb-trigger',
              'data-max': labelAtMax ? 'true' : 'false',
              'aria-expanded': open ? 'true' : 'false',
              'aria-haspopup': 'dialog',
              'aria-controls': POPOVER_ID,
              title: `${t('trigger.title')} · V${VERSION}`,
              style: { '--dsb-r': String(labelEffortRatio) },
              onClick: () => setOpen((value) => !value),
            },
            h('span', { className: 'dsb-trigger-icon', 'aria-hidden': 'true' }, h(BoltIcon)),
            h('span', { className: 'dsb-trigger-model' }, labelModel || '—'),
            labelEffort ? h('span', { className: 'dsb-trigger-sep', 'aria-hidden': 'true' }, '·') : null,
            labelEffort ? h('span', { className: 'dsb-trigger-effort' }, labelEffort) : null,
            h(
              'span',
              { className: 'dsb-trigger-chev', 'aria-hidden': 'true' },
              h(
                'svg',
                {
                  viewBox: '0 0 24 24',
                  width: 12,
                  height: 12,
                  fill: 'none',
                  stroke: 'currentColor',
                  strokeWidth: 2,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                },
                h('path', { d: 'm6 9 6 6 6-6' }),
              ),
            ),
          ),
          open
            ? h(
                'div',
                {
                  id: POPOVER_ID,
                  className: 'dsb-popover',
                  role: 'dialog',
                  'aria-label': t('label.switch'),
                  style: {
                    '--dsb-shift': `${popoverShift}px`,
                    '--dsb-half': `${popoverHalf}px`,
                  },
                },
                h(
                  'div',
                  { className: 'dsb-card', 'data-max': view === 'control' && effectMax ? 'true' : 'false', 'data-view': view },
                  h(
                  'div',
                  { className: 'dsb-head' },
                  view === 'settings'
                    ? h(
                        'button',
                        {
                          type: 'button',
                          className: 'dsb-slot dsb-back-btn',
                          title: t('settings.back'),
                          'aria-label': t('settings.back'),
                          onClick: () => setView('control'),
                        },
                        h(BackIcon),
                      )
                    : h(
                        'button',
                        {
                          type: 'button',
                          className: 'dsb-slot dsb-settings-btn',
                          title: t('settings.open'),
                          'aria-label': t('settings.open'),
                          onClick: () => setView('settings'),
                        },
                        h(BoltIcon),
                      ),
                  h(
                    'div',
                    { className: 'dsb-titles', key: `${view}:${dimension}` },
                    h(
                      'div',
                      {
                        className: 'dsb-title',
                        'data-max': view === 'control' && effectMax ? 'true' : 'false',
                        'data-long': view === 'control' && displayLong ? 'true' : 'false',
                        title: view === 'settings' ? t('settings.title') : displayTitle,
                      },
                      view === 'settings' ? t('settings.title') : displayTitle,
                    ),
                    h(
                      'div',
                      {
                        className: 'dsb-sub',
                        ...(view === 'control' && subtitleTarget
                          ? {
                              role: 'button',
                              tabIndex: 0,
                              title: t('label.switch'),
                              onClick: () => switchDimension(subtitleTarget),
                              onKeyDown: (event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  switchDimension(subtitleTarget);
                                }
                              },
                            }
                          : {}),
                      },
                      h(
                        'span',
                        { className: 'dsb-subtext', title: view === 'settings' ? `${t('settings.subtitle')} · V${VERSION}` : displaySubtitle },
                        view === 'settings' ? `${t('settings.subtitle')} · V${VERSION}` : displaySubtitle,
                      ),
                      view === 'control' && subtitleTarget
                        ? h('span', { className: 'dsb-chev', 'aria-hidden': 'true' }, '›')
                        : null,
                      view === 'control' && modeHint ? h('span', { className: 'dsb-chip' }, t('hint.locked')) : null,
                    ),
                  ),
                  view === 'settings'
                    ? h('span', { className: 'dsb-slot', 'aria-hidden': 'true' })
                    : h(
                        'button',
                        {
                          type: 'button',
                          className: 'dsb-slot dsb-reset',
                          title: t('reset'),
                          'aria-label': t('reset'),
                          disabled,
                          onClick: reset,
                        },
                        h(ResetIcon),
                      ),
                ),
                view === 'settings'
                  ? h(React.Fragment, null, settingsRows, settingsFooter)
                  : total === 0
                    ? h('div', { className: 'dsb-empty' }, emptyText)
                    : h(
                      'div',
                      {
                        ref: trackRef,
                        className: 'dsb-slider',
                        role: 'slider',
                        tabIndex: disabled ? -1 : 0,
                        'aria-label': t('aria.slider', { label, count: total }),
                        'aria-valuemin': 0,
                        'aria-valuemax': Math.max(0, total - 1),
                        'aria-valuenow': Math.max(0, shownIndex),
                        'aria-valuetext': ariaValueText,
                        'aria-disabled': disabled ? 'true' : 'false',
                        title: dimension === 'mode' && !blank ? t('mode.lockedHint') : undefined,
                        onPointerDown,
                        onPointerMove,
                        onPointerUp: endDrag,
                        onPointerCancel: (event) => {
                          if (!dragRef.current) return;
                          dragRef.current = null;
                          setDrag(null);
                          if (typeof event.currentTarget.releasePointerCapture === 'function') {
                            try {
                              if (event.currentTarget.hasPointerCapture && event.currentTarget.hasPointerCapture(event.pointerId)) {
                                event.currentTarget.releasePointerCapture(event.pointerId);
                              }
                            } catch {}
                          }
                        },
                        onKeyDown,
                      },
                      h(
                        'div',
                        { className: 'dsb-track' },
                        h('div', { className: 'dsb-fill' }),
                        h(
                          'div',
                          { className: 'dsb-dots' },
                          Array.from({ length: total }, (_, index) =>
                            h('i', {
                              key: index,
                              className: 'dsb-dot',
                              'data-passed': index <= shownIndex ? 'true' : 'false',
                            }),
                          ),
                        ),
                        h('div', { className: 'dsb-stars' }, stars),
                      ),
                      h(
                        'svg',
                        {
                          className: 'dsb-thumb',
                          viewBox: `0 0 ${THUMB} ${THUMB}`,
                          width: THUMB,
                          height: THUMB,
                          'aria-hidden': 'true',
                        },
                        h('circle', { cx: THUMB / 2, cy: THUMB / 2, r: THUMB / 2, fill: '#fff' }),
                      ),
                      effectMax && burst > 0 ? h('div', { key: `burst-${burst}`, className: 'dsb-burst' }, burstDots) : null,
                    ),
                h('div', { className: 'dsb-tabs', role: 'tablist', 'aria-label': t('label.switch') }, tabs),
                view === 'settings'
                  ? h('div', { className: 'dsb-note' }, note ? note.text : t('settings.note'))
                  : note
                    ? h('div', { className: 'dsb-note', 'data-error': note.error ? 'true' : 'false' }, note.text)
                    : modelError
                      ? h('div', { className: 'dsb-note', 'data-error': 'true' }, modelError)
                      : null,
              ),
            )
          : null,
        ),
      );
    }

    const inject = ['slots', 'locale', 'modelDirectories', 'remote', 'remote.agentPresets', 'remote.settings', 'remote.session'];

    function apply(ctx) {
      ctx.effect(
        () =>
          ctx.locale.register(NS, {
            zh: ZH,
            en: EN,
          }),
        'strength-bar: dictionaries',
      );
      const t = ctx.locale.bind(NS);
      const models = ctx.modelDirectories;
      const remote = ctx.remote;

      const Control = (props) => h(StrengthControl, { ...props, t, models, remote });

      // The capsule sits in the composer tool row, immediately before the send
      // action; its popover opens directly above it.
      ctx.slots.inject('conversation.input.right', () =>
        ctx.slots.register(
          {
            name: 'conversation.input.right',
            id: 'strength-bar-trigger',
            order: 10,
          },
          Control,
        ),
      );

      // Take the composer tool row's model seat: the strength entry now owns
      // model and effort selection, so the shipped trigger would duplicate it.
      ctx.slots.inject('conversation.input.model', () =>
        ctx.slots.register(
          {
            name: 'conversation.input.model',
            priority: -1,
          },
          () => null,
        ),
      );
    }

    return { inject, apply };
  },
});
