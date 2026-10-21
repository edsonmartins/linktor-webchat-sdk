/**
 * Widget CSS as a string, injected once per page. Everything themeable is driven
 * by `--linktor-*` custom properties with built-in fallbacks, so a single
 * stylesheet serves every instance and each instance re-themes itself by setting
 * those variables on its own root element (see LinktorWebChat.applyTheme).
 */
export function widgetStyles(position: 'left' | 'right', zIndex: number): string {
  return `
    .linktor-widget {
      position: fixed; bottom: 20px; ${position}: 20px; z-index: ${zIndex};
      font-family: var(--linktor-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif);
      font-size: var(--linktor-font-size, 14px);
    }
    .linktor-launcher {
      width: var(--linktor-launcher-size, 60px); height: var(--linktor-launcher-size, 60px); border-radius: 50%;
      background-color: var(--linktor-color, #007bff); border: none; cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    .linktor-launcher:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(0,0,0,.2); }
    .linktor-launcher svg { width: 28px; height: 28px; fill: var(--linktor-launcher-icon-color, #fff); }
    .linktor-chat {
      display: none; position: absolute; bottom: 80px; ${position}: 0;
      width: var(--linktor-width, 370px); height: var(--linktor-height, 520px);
      background: var(--linktor-background, #fff); border-radius: var(--linktor-radius, 12px);
      box-shadow: 0 5px 40px rgba(0,0,0,.16); overflow: hidden; flex-direction: column;
    }
    .linktor-chat.open { display: flex; }
    .linktor-header {
      background-color: var(--linktor-header-bg, var(--linktor-color, #007bff)); color: var(--linktor-header-color, #fff); padding: 16px 20px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .linktor-header-title { font-size: 16px; font-weight: 600; }
    .linktor-header-status { font-size: 12px; opacity: .9; }
    .linktor-close { background: none; border: none; color: currentColor; cursor: pointer; padding: 4px; display: flex; }
    .linktor-close svg { width: 20px; height: 20px; fill: currentColor; }
    .linktor-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .linktor-message { max-width: 80%; padding: 10px 14px; border-radius: 16px; line-height: 1.4; word-wrap: break-word; }
    /* The visitor's own messages sit on the right in the brand color; the agent's on the left in gray. */
    .linktor-message.contact { background-color: var(--linktor-visitor-bubble-bg, var(--linktor-color, #007bff)); color: var(--linktor-visitor-bubble-color, #fff); align-self: flex-end; border-bottom-right-radius: 4px; }
    .linktor-message.user { background-color: var(--linktor-agent-bubble-bg, #e9ecef); color: var(--linktor-agent-bubble-color, #333); align-self: flex-start; border-bottom-left-radius: 4px; }
    .linktor-message.system { background-color: #6c757d; color: #fff; align-self: center; font-size: 12px; }
    .linktor-message.sending { opacity: .65; }
    .linktor-message.failed { box-shadow: 0 0 0 2px #dc3545; }
    .linktor-message img { max-width: 100%; border-radius: 8px; display: block; }
    .linktor-message a.linktor-image { display: block; }
    .linktor-message audio { display: block; width: 240px; max-width: 100%; margin-top: 2px; }
    .linktor-message a.linktor-file { color: inherit; text-decoration: underline; word-break: break-all; }
    .linktor-message-time { font-size: 10px; opacity: .7; margin-top: 4px; }
    .linktor-message-status { font-size: 10px; margin-top: 2px; opacity: .85; }
    .linktor-message.failed .linktor-message-status { color: #dc3545; opacity: 1; }
    .linktor-typing { display: none; padding: 10px 14px; background-color: var(--linktor-agent-bubble-bg, #e9ecef); border-radius: 16px; align-self: flex-start; max-width: 60px; }
    .linktor-typing.show { display: block; }
    .linktor-typing-dots { display: flex; gap: 4px; }
    .linktor-typing-dot { width: 8px; height: 8px; background-color: #999; border-radius: 50%; animation: linktor-bounce 1.4s infinite ease-in-out; }
    .linktor-typing-dot:nth-child(1) { animation-delay: -.32s; }
    .linktor-typing-dot:nth-child(2) { animation-delay: -.16s; }
    @keyframes linktor-bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
    .linktor-input-area { padding: 12px 16px; border-top: 1px solid #e9ecef; display: flex; gap: 6px; align-items: flex-end; }
    .linktor-input {
      flex: 1; min-width: 0; border: 1px solid #e9ecef; border-radius: 20px; padding: 10px 16px; font-size: 14px;
      outline: none; resize: none; max-height: 100px; font-family: inherit;
    }
    .linktor-input:focus { border-color: var(--linktor-color, #007bff); }
    .linktor-send {
      width: 40px; height: 40px; border-radius: 50%; background-color: var(--linktor-color, #007bff);
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .linktor-send:disabled { opacity: .5; cursor: not-allowed; }
    .linktor-send svg { width: 20px; height: 20px; fill: #fff; }
    .linktor-icon-btn {
      width: 40px; height: 40px; border-radius: 50%; background: none; border: none; cursor: pointer; color: #666;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .linktor-icon-btn:hover { background: #f0f0f0; color: var(--linktor-color, #007bff); }
    .linktor-icon-btn svg { width: 22px; height: 22px; fill: currentColor; }
    .linktor-icon-btn[hidden], .linktor-file-input { display: none; }
    .linktor-recording { display: none; flex: 1; align-items: center; gap: 10px; min-height: 40px; }
    /* Direct children only: the recording bar has its own .linktor-send inside .linktor-recording. */
    .linktor-input-area.recording > .linktor-input,
    .linktor-input-area.recording > .linktor-send,
    .linktor-input-area.recording > .linktor-attach,
    .linktor-input-area.recording > .linktor-record { display: none; }
    .linktor-input-area.recording .linktor-recording { display: flex; }
    .linktor-rec-dot { width: 10px; height: 10px; border-radius: 50%; background: #dc3545; animation: linktor-blink 1s infinite; flex-shrink: 0; }
    @keyframes linktor-blink { 50% { opacity: .15; } }
    .linktor-rec-time { flex: 1; font-variant-numeric: tabular-nums; color: #333; }
    .linktor-powered { text-align: center; padding: 8px; font-size: 11px; color: #999; border-top: 1px solid #f0f0f0; }
    .linktor-powered a { color: #666; text-decoration: none; }
    @media (max-width: 480px) {
      .linktor-chat { position: fixed; inset: 0; width: 100%; height: 100%; border-radius: 0; }
    }
  `
}
