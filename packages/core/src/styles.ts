/**
 * Widget CSS as a string, injected once per page. Colors are driven by the
 * `--linktor-color` custom property so a single instance can be re-themed at
 * runtime from the server config or `primaryColor`.
 */
export function widgetStyles(position: 'left' | 'right', zIndex: number): string {
  return `
    .linktor-widget {
      position: fixed; bottom: 20px; ${position}: 20px; z-index: ${zIndex};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 14px;
    }
    .linktor-launcher {
      width: 60px; height: 60px; border-radius: 50%;
      background-color: var(--linktor-color, #007bff); border: none; cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      display: flex; align-items: center; justify-content: center;
      transition: transform .2s, box-shadow .2s;
    }
    .linktor-launcher:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(0,0,0,.2); }
    .linktor-launcher svg { width: 28px; height: 28px; fill: #fff; }
    .linktor-chat {
      display: none; position: absolute; bottom: 80px; ${position}: 0;
      width: 370px; height: 520px; background: #fff; border-radius: 12px;
      box-shadow: 0 5px 40px rgba(0,0,0,.16); overflow: hidden; flex-direction: column;
    }
    .linktor-chat.open { display: flex; }
    .linktor-header {
      background-color: var(--linktor-color, #007bff); color: #fff; padding: 16px 20px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .linktor-header-title { font-size: 16px; font-weight: 600; }
    .linktor-header-status { font-size: 12px; opacity: .9; }
    .linktor-close { background: none; border: none; color: #fff; cursor: pointer; padding: 4px; display: flex; }
    .linktor-close svg { width: 20px; height: 20px; fill: currentColor; }
    .linktor-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .linktor-message { max-width: 80%; padding: 10px 14px; border-radius: 16px; line-height: 1.4; word-wrap: break-word; }
    .linktor-message.contact { background-color: #e9ecef; color: #333; align-self: flex-start; border-bottom-left-radius: 4px; }
    .linktor-message.user { background-color: var(--linktor-color, #007bff); color: #fff; align-self: flex-end; border-bottom-right-radius: 4px; }
    .linktor-message.system { background-color: #6c757d; color: #fff; align-self: center; font-size: 12px; }
    .linktor-message img { max-width: 100%; border-radius: 8px; display: block; }
    .linktor-message-time { font-size: 10px; opacity: .7; margin-top: 4px; }
    .linktor-typing { display: none; padding: 10px 14px; background-color: #e9ecef; border-radius: 16px; align-self: flex-start; max-width: 60px; }
    .linktor-typing.show { display: block; }
    .linktor-typing-dots { display: flex; gap: 4px; }
    .linktor-typing-dot { width: 8px; height: 8px; background-color: #999; border-radius: 50%; animation: linktor-bounce 1.4s infinite ease-in-out; }
    .linktor-typing-dot:nth-child(1) { animation-delay: -.32s; }
    .linktor-typing-dot:nth-child(2) { animation-delay: -.16s; }
    @keyframes linktor-bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
    .linktor-input-area { padding: 12px 16px; border-top: 1px solid #e9ecef; display: flex; gap: 8px; align-items: flex-end; }
    .linktor-input {
      flex: 1; border: 1px solid #e9ecef; border-radius: 20px; padding: 10px 16px; font-size: 14px;
      outline: none; resize: none; max-height: 100px; font-family: inherit;
    }
    .linktor-input:focus { border-color: var(--linktor-color, #007bff); }
    .linktor-send {
      width: 40px; height: 40px; border-radius: 50%; background-color: var(--linktor-color, #007bff);
      border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .linktor-send:disabled { opacity: .5; cursor: not-allowed; }
    .linktor-send svg { width: 20px; height: 20px; fill: #fff; }
    .linktor-powered { text-align: center; padding: 8px; font-size: 11px; color: #999; border-top: 1px solid #f0f0f0; }
    .linktor-powered a { color: #666; text-decoration: none; }
    @media (max-width: 480px) {
      .linktor-chat { position: fixed; inset: 0; width: 100%; height: 100%; border-radius: 0; }
    }
  `
}
