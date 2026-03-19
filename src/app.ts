(() => {
  const root = document.getElementById("appRoot");
  if (!root) return;

  const STORAGE_KEY = "paltu-sathi-state-v2";
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"hunger":70,"joy":72,"energy":68,"clean":74,"name":"Mithu","species":"cat","journal":["Mithu ne aaj stretch kiya."]}');

  const speciesMap = {
    cat: { face: "=(^.^)=", title: "Billi", vibe: "Shaant, pyari, thodi royal." },
    dog: { face: "Uo^.^oU", title: "Kutta", vibe: "Friendly, loyal, full excitement." },
    bunny: { face: "(\")_(\")", title: "Bunny", vibe: "Soft, jumpy, sweet energy." },
    parrot: { face: "<(o )___", title: "Tota", vibe: "Chatty, colorful, playful." }
  };

  root.innerHTML = `
    <section class="section-stack">
      <article class="tool-card pet-shell">
        <div class="toolbar">
          <div>
            <p class="eyebrow">Virtual pet room</p>
            <h3>Pet choose karo aur usko pyaar do</h3>
          </div>
        </div>
        <div class="choice-grid pet-choice-grid" id="speciesGrid"></div>
        <div class="pet-stage pet-stage-cute">
          <div class="pet-face" id="petFace">=(^.^)=</div>
          <div class="result-panel">
            <p class="mini-label">Mood line</p>
            <strong id="moodText">Mithu khush hai.</strong>
            <p class="muted" id="petVibe">Soft pet vibes loading...</p>
          </div>
        </div>
      </article>

      <article class="tool-card pet-shell">
        <label class="field-label" for="petNameInput">Pet name</label>
        <input class="text-input" id="petNameInput" type="text" placeholder="Mithu">
        <div class="pet-grid">
          <button class="pet-btn primary" data-action="feed" type="button">Feed</button>
          <button class="pet-btn" data-action="play" type="button">Play</button>
          <button class="pet-btn" data-action="rest" type="button">Rest</button>
          <button class="pet-btn" data-action="clean" type="button">Groom</button>
        </div>
      </article>
    </section>

    <aside class="section-stack">
      <article class="info-card">
        <p class="eyebrow">Pet meters</p>
        <div class="pet-meters" id="meterList"></div>
      </article>
      <article class="info-card">
        <p class="eyebrow">Mini journal</p>
        <div class="history-grid" id="journalList"></div>
      </article>
    </aside>
  `;

  const meterList = document.getElementById("meterList");
  const moodText = document.getElementById("moodText");
  const petFace = document.getElementById("petFace");
  const petNameInput = document.getElementById("petNameInput") as HTMLInputElement | null;
  const petVibe = document.getElementById("petVibe");
  const speciesGrid = document.getElementById("speciesGrid");
  const journalList = document.getElementById("journalList");

  function clamp(value) {
    return Math.max(0, Math.min(100, value));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function activeSpecies() {
    return speciesMap[state.species] || speciesMap.cat;
  }

  function addJournal(entry) {
    state.journal.unshift(entry);
    state.journal = state.journal.slice(0, 6);
  }

  function moodSummary() {
    const low = Object.values({ hunger: state.hunger, joy: state.joy, energy: state.energy, clean: state.clean }).filter((value) => value < 40).length;
    if (low >= 2) return `${state.name} ko thoda aur care chahiye.`;
    if (state.joy > 75 && state.energy > 60) return `${state.name} full masti mode me hai.`;
    if (state.energy < 35) return `${state.name} ko nap chahiye.`;
    return `${state.name} bilkul cozy mood me hai.`;
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

  function renderSpecies() {
    speciesGrid.innerHTML = Object.entries(speciesMap).map(([key, value]) => `
      <button class="choice-card species-card ${state.species === key ? "species-card-active" : ""}" data-species="${key}" type="button">
        <strong>${value.title}</strong>
        <span class="muted">${value.face}</span>
        <span class="muted">${value.vibe}</span>
      </button>
    `).join("");
  }

  function renderJournal() {
    journalList.innerHTML = state.journal.length
      ? state.journal.map((entry) => `<div class="history-card"><strong>${entry}</strong><span class="muted">Care memory</span></div>`).join("")
      : '<div class="history-card"><strong>Journal ready hai</strong><span class="muted">Actions se cute updates yahan aayenge.</span></div>';
  }

  function render() {
    const species = activeSpecies();
    if (petNameInput) petNameInput.value = state.name;
    moodText.textContent = moodSummary();
    petFace.textContent = species.face;
    petVibe.textContent = `${species.title}: ${species.vibe}`;
    renderMeters();
    renderSpecies();
    renderJournal();
  }

  function applyAction(action) {
    if (action === "feed") {
      state.hunger = clamp(state.hunger + 18);
      state.clean = clamp(state.clean - 4);
      addJournal(`${state.name} ne tasty treat khayi.`);
    }
    if (action === "play") {
      state.joy = clamp(state.joy + 20);
      state.energy = clamp(state.energy - 14);
      state.hunger = clamp(state.hunger - 8);
      addJournal(`${state.name} ne mast play session enjoy kiya.`);
    }
    if (action === "rest") {
      state.energy = clamp(state.energy + 22);
      state.joy = clamp(state.joy + 4);
      addJournal(`${state.name} ne cozy nap li.`);
    }
    if (action === "clean") {
      state.clean = clamp(state.clean + 24);
      state.joy = clamp(state.joy + 6);
      addJournal(`${state.name} ab bilkul fresh lag raha hai.`);
    }
    state.hunger = clamp(state.hunger - 2);
    save();
    render();
  }

  root.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const speciesButton = target.closest("[data-species]") as HTMLElement | null;
    if (speciesButton) {
      state.species = speciesButton.dataset.species || "cat";
      addJournal(`${activeSpecies().title} room me aa gaya.`);
      save();
      render();
      return;
    }

    const actionButton = target.closest("[data-action]") as HTMLElement | null;
    if (actionButton) {
      applyAction(actionButton.dataset.action);
    }
  });

  petNameInput?.addEventListener("input", () => {
    state.name = petNameInput.value.trim() || "Mithu";
    save();
    render();
  });

  render();
})();
