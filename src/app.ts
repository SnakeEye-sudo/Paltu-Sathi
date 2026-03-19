(() => {
  const root = document.getElementById("appRoot");
  if (!root) return;

  const STORAGE_KEY = "paltu-sathi-state";
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"hunger":70,"joy":72,"energy":68,"clean":74,"name":"Mithu"}');

  root.innerHTML = `
    <section class="section-stack">
      <article class="tool-card">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Virtual pet</p>
            <h3>Feed, play, rest, repeat</h3>
          </div>
        </div>
        <div class="pet-stage">
          <div class="pet-face" id="petFace">(o^.^o)</div>
          <div class="result-panel">
            <p class="mini-label">Mood line</p>
            <strong id="moodText">Mithu is cheerful.</strong>
            <p class="muted">Har action meter ko alag tarah se affect karta hai.</p>
          </div>
        </div>
      </article>

      <article class="tool-card">
        <label class="field-label" for="petNameInput">Pet name</label>
        <input class="text-input" id="petNameInput" type="text" placeholder="Mithu">
        <div class="pet-grid">
          <button class="pet-btn primary" data-action="feed" type="button">Feed</button>
          <button class="pet-btn" data-action="play" type="button">Play</button>
          <button class="pet-btn" data-action="rest" type="button">Rest</button>
          <button class="pet-btn" data-action="clean" type="button">Clean</button>
        </div>
      </article>
    </section>

    <aside class="section-stack">
      <article class="info-card">
        <p class="eyebrow">Pet meters</p>
        <div class="pet-meters" id="meterList"></div>
      </article>
      <article class="info-card">
        <p class="eyebrow">Care hint</p>
        <div class="history-grid">
          <div class="history-card"><strong>Balance</strong><span class="muted">Sab meter 60+ rakho to mood bright rehta hai.</span></div>
          <div class="history-card"><strong>Rest loop</strong><span class="muted">Play ke baad rest energy ko recover karta hai.</span></div>
        </div>
      </article>
    </aside>
  `;

  const meterList = document.getElementById("meterList");
  const moodText = document.getElementById("moodText");
  const petFace = document.getElementById("petFace");
  const petNameInput = document.getElementById("petNameInput");

  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function moodSummary() {
    const low = Object.values({ hunger: state.hunger, joy: state.joy, energy: state.energy, clean: state.clean }).filter((value) => value < 40).length;
    if (low >= 2) return { text: `${state.name} needs attention.`, face: "(._.)" };
    if (state.joy > 75 && state.energy > 60) return { text: `${state.name} is dancing with full joy.`, face: "(^o^)/" };
    if (state.energy < 35) return { text: `${state.name} is sleepy.`, face: "(-.-)zZ" };
    return { text: `${state.name} is cheerful.`, face: "(o^.^o)" };
  }

  function renderMeters() {
    const meters = [
      ["Hunger", state.hunger],
      ["Joy", state.joy],
      ["Energy", state.energy],
      ["Clean", state.clean]
    ];
    meterList.innerHTML = meters.map(([label, value]) => `
      <div>
        <div class="meter-label"><span>${label}</span><span>${value}%</span></div>
        <div class="meter-bar"><div class="meter-fill" style="width:${value}%"></div></div>
      </div>
    `).join("");
  }

  function render() {
    petNameInput.value = state.name;
    const mood = moodSummary();
    moodText.textContent = mood.text;
    petFace.textContent = mood.face;
    renderMeters();
  }

  function applyAction(action) {
    if (action === "feed") {
      state.hunger = clamp(state.hunger + 18);
      state.clean = clamp(state.clean - 4);
      state.energy = clamp(state.energy + 4);
    }
    if (action === "play") {
      state.joy = clamp(state.joy + 20);
      state.energy = clamp(state.energy - 14);
      state.hunger = clamp(state.hunger - 8);
    }
    if (action === "rest") {
      state.energy = clamp(state.energy + 22);
      state.joy = clamp(state.joy + 4);
    }
    if (action === "clean") {
      state.clean = clamp(state.clean + 24);
      state.joy = clamp(state.joy + 6);
    }
    state.hunger = clamp(state.hunger - 2);
    save();
    render();
  }

  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => applyAction(button.getAttribute("data-action")));
  });
  petNameInput?.addEventListener("input", () => {
    state.name = petNameInput.value.trim() || "Mithu";
    save();
    render();
  });

  render();
})();