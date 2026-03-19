"use strict";
(() => {
  const PROMPT_ID = "sathi-notification-prompt";
  const DISMISS_KEY = `${location.pathname}:notification-prompt-dismissed-until`;
  const GRANTED_KEY = `${location.pathname}:notification-prompt-granted`;
  const DAY = 24 * 60 * 60 * 1000;
  let refreshing = false;

  async function refreshInstalledShell() {
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
    } catch (error) {
      console.error("Service worker refresh check failed", error);
    }
  }

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return null;
    if (window.__sathiSwManaged) return navigator.serviceWorker.getRegistration();

    window.__sathiSwManaged = true;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    try {
      const registration = await navigator.serviceWorker.register("./sw.js", { updateViaCache: "none" });
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            worker.postMessage({ type: "SKIP_WAITING" });
          }
        });
      });
      await registration.update();
      return registration;
    } catch (error) {
      console.error("Service worker registration failed", error);
      return null;
    }
  }

  function saveDismiss(days) {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + days * DAY));
  }

  function isDismissed() {
    const raw = Number(localStorage.getItem(DISMISS_KEY) || "0");
    return Number.isFinite(raw) && raw > Date.now();
  }

  function removePrompt() {
    document.getElementById(PROMPT_ID)?.remove();
  }

  async function showWelcomeNotification() {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          await registration.showNotification(document.title || "Sathi app", {
            body: "Reminders aur important updates ab time par milenge.",
            tag: "sathi-notification-enabled"
          });
          return;
        }
      }
      new Notification(document.title || "Sathi app", {
        body: "Reminders aur important updates ab time par milenge."
      });
    } catch (error) {
      console.error("Notification welcome preview failed", error);
    }
  }

  function injectPrompt() {
    if (!("Notification" in window)) return;
    if (document.getElementById(PROMPT_ID) || isDismissed()) return;
    if (Notification.permission === "granted") {
      localStorage.setItem(GRANTED_KEY, "true");
      return;
    }

    const denied = Notification.permission === "denied";
    const prompt = document.createElement("section");
    prompt.id = PROMPT_ID;
    prompt.setAttribute("role", "dialog");
    prompt.setAttribute("aria-live", "polite");
    prompt.innerHTML = `
      <style>
        #${PROMPT_ID} {
          position: fixed;
          inset: auto 16px 16px 16px;
          z-index: 10000;
          display: grid;
          gap: 14px;
          width: min(420px, calc(100vw - 32px));
          margin-left: auto;
          padding: 18px;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: linear-gradient(180deg, rgba(10, 16, 27, 0.96), rgba(15, 24, 39, 0.92));
          color: #f4f8ff;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          font-family: "Noto Sans Devanagari", sans-serif;
        }
        #${PROMPT_ID} h3 {
          margin: 0;
          font-size: 1.05rem;
          line-height: 1.35;
        }
        #${PROMPT_ID} p {
          margin: 0;
          color: rgba(244, 248, 255, 0.82);
          line-height: 1.55;
          font-size: 0.94rem;
        }
        #${PROMPT_ID} .sathi-notification-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        #${PROMPT_ID} button {
          border: none;
          border-radius: 999px;
          min-height: 44px;
          padding: 0 16px;
          font: inherit;
          cursor: pointer;
        }
        #${PROMPT_ID} .sathi-allow-btn {
          background: linear-gradient(135deg, #5cf2d6, #ffb36b);
          color: #07121a;
          font-weight: 700;
        }
        #${PROMPT_ID} .sathi-secondary-btn {
          background: rgba(255, 255, 255, 0.08);
          color: #f4f8ff;
          border: 1px solid rgba(255, 255, 255, 0.14);
        }
        @media (max-width: 640px) {
          #${PROMPT_ID} {
            inset: auto 12px 12px 12px;
            width: auto;
            border-radius: 20px;
            padding: 16px;
          }
          #${PROMPT_ID} .sathi-notification-actions {
            flex-direction: column;
          }
          #${PROMPT_ID} button {
            width: 100%;
          }
        }
      </style>
      <h3>${denied ? "Notifications blocked hain" : "Notifications on karen?"}</h3>
      <p>${denied
        ? "Browser me notifications block hain. Settings me allow kar doge to reminders aur updates time par milenge."
        : "Is app ke reminders, updates, aur helpful nudges ke liye notifications allow kar dijiye."}</p>
      <div class="sathi-notification-actions">
        <button class="${denied ? "sathi-secondary-btn" : "sathi-allow-btn"}" type="button" data-action="allow">${denied ? "Kaise on karein" : "Allow notifications"}</button>
        <button class="sathi-secondary-btn" type="button" data-action="later">Baad me</button>
      </div>
    `;

    prompt.addEventListener("click", async (event) => {
      const button = event.target instanceof HTMLElement ? event.target.closest("button[data-action]") : null;
      const action = button?.getAttribute("data-action");
      if (!action) return;

      if (action === "later") {
        saveDismiss(3);
        removePrompt();
        return;
      }

      if (Notification.permission === "denied") {
        window.alert("Browser site settings me jaakar notifications ko Allow kijiye, phir app dobara kholiye.");
        saveDismiss(2);
        removePrompt();
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          localStorage.setItem(GRANTED_KEY, "true");
          removePrompt();
          await showWelcomeNotification();
          return;
        }
      } catch (error) {
        console.error("Notification prompt failed", error);
      }

      saveDismiss(2);
      removePrompt();
    });

    document.body.appendChild(prompt);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void refreshInstalledShell();
    }
  });

  window.addEventListener("focus", () => {
    void refreshInstalledShell();
  });

  window.addEventListener("load", () => {
    void registerServiceWorker();
    if ("Notification" in window) {
      window.setTimeout(injectPrompt, 1400);
    }
  }, { once: true });
})();
