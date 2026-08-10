import "./styles.css";
import type { Capsule, Engine, TimelineStep } from "./types";
import engineManifest from "../config/engines.json";

const capsuleModules = import.meta.glob<{ default: Capsule }>("../capsules/*.json", {
  eager: true,
});

const capsules = Object.values(capsuleModules)
  .map((module) => module.default)
  .sort((a, b) => a.caseNumber.localeCompare(b.caseNumber));
const engines = (engineManifest as { engines: Record<string, Engine> }).engines;

let activeId = location.hash.slice(1);
if (!capsules.some((capsule) => capsule.id === activeId)) activeId = capsules[0]!.id;
let activeStep = 0;
let activeFilter = "all";

const app = document.querySelector<HTMLDivElement>("#app")!;
if (!app) throw new Error("Application root is missing");

const icon = (name: "arrow" | "download" | "github" | "seal" | "chevron") => {
  const paths = {
    arrow: '<path d="M5 12h14M14 6l6 6-6 6"/>',
    download: '<path d="M12 3v12m0 0 5-5m-5 5-5-5M5 20h14"/>',
    github: '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.8c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.78c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
    seal: '<path d="m12 2 2.1 2.2 3-.4.5 3 2.7 1.4-1.4 2.7 1.4 2.7-2.7 1.4-.5 3-3-.4L12 20l-2.1-2.2-3 .4-.5-3-2.7-1.4 1.4-2.7-1.4-2.7L6.4 7l.5-3 3 .4L12 2Z"/><path d="m9.3 11.2 1.8 1.8 3.8-4"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]}</svg>`;
};

function repositoryUrl(capsule: Capsule, path = "") {
  const engine = engines[capsule.engine]!;
  return `https://github.com/${engine.repository}/blob/${capsule.commit}/${path}`;
}

function evidenceUrl(capsule: Capsule) {
  const { testPath, testLines } = capsule.verification;
  return `${repositoryUrl(capsule, testPath)}#L${testLines[0]}-L${testLines[1]}`;
}

function tapeStep(step: TimelineStep, index: number) {
  return `
    <button class="tape-node ${index === activeStep ? "is-active" : ""}" data-step="${index}" data-state="${step.state}" aria-label="View ${step.phase}: ${step.title}">
      <span class="tape-index">${String(index + 1).padStart(2, "0")}</span>
      <span class="tape-phase">${step.phase}</span>
      <span class="tape-dot"></span>
    </button>`;
}

function caseRailItem(capsule: Capsule) {
  const metric = capsule.metrics[0]!;
  return `
    <button class="case-index-item ${capsule.id === activeId ? "is-active" : ""}" data-case="${capsule.id}" aria-label="Open ${capsule.caseNumber}: ${capsule.title}">
      <span class="case-index-number">${capsule.caseNumber}</span>
      <span class="case-index-copy">
        <strong>${capsule.title}</strong>
        <small>${capsule.system}</small>
      </span>
      <span class="case-index-reading"><b>${metric.broken}</b><small>${metric.unit}</small></span>
      ${icon("chevron")}
    </button>`;
}

function render() {
  const active = capsules.find((capsule) => capsule.id === activeId) ?? capsules[0]!;
  const engine = engines[active.engine]!;
  const command = engine.commands[active.verification.commandId]!;
  const step = active.timeline[Math.min(activeStep, active.timeline.length - 1)]!;
  const filtered = activeFilter === "all"
    ? capsules
    : capsules.filter((capsule) => capsule.disposition === activeFilter || capsule.system.toLowerCase().includes(activeFilter));
  const recoveredCount = capsules.filter((capsule) => capsule.disposition === "repaired").length;

  app.innerHTML = `
    <header class="masthead">
      <a class="wordmark" href="#${active.id}" aria-label="COUNTEREXAMPLE home">
        <span class="wordmark-mark"><i></i><i></i><i></i></span>
        <span>COUNTER<span>EXAMPLE</span></span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="#case-file">CASE FILE</a>
        <a href="#protocol">SUBMISSION PROTOCOL</a>
        <a href="https://github.com/asp53826/counterexample" target="_blank" rel="noreferrer">SOURCE ${icon("arrow")}</a>
      </nav>
      <span class="release-chip"><i></i> v1.0.0 / STABLE</span>
    </header>

    <main>
      <section class="hero" aria-labelledby="museum-title">
        <div class="hero-copy">
          <p class="eyebrow"><span>PUBLIC ENGINEERING INSTITUTION</span><span>REGISTER 001–012</span></p>
          <h1 id="museum-title">Failures,<br><em>admitted.</em></h1>
          <p class="hero-deck">A public museum of engineering claims that broke under pressure—and the exact evidence that constrained them.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#case-file">OPERATE THE EVIDENCE ${icon("arrow")}</a>
            <a class="button button-quiet" href="./receipts/counterexample-v1.0.0-receipts.tar.gz" download>${icon("download")} RECEIPT BUNDLE</a>
          </div>
        </div>
        <div class="hero-apparatus" aria-hidden="true">
          <div class="apparatus-label">CAUSAL APERTURE / LIVE REGISTER</div>
          <div class="aperture">
            <div class="aperture-grid"></div>
            <div class="signal signal-a"></div>
            <div class="signal signal-b"></div>
            <div class="fault-slit"></div>
            <div class="crosshair"></div>
            <span class="scope-id">CX / 000</span>
            <span class="scope-state">FAULT WITNESS</span>
          </div>
          <div class="apparatus-readout">
            <span>ENGINES <b>08</b></span>
            <span>CASES <b>12</b></span>
            <span>REPAIRED <b>${String(recoveredCount).padStart(2, "0")}</b></span>
          </div>
        </div>
      </section>

      <section class="register" aria-label="Case register">
        <div><span class="register-number">12</span><span>REAL FAILURE<br>CAPSULES</span></div>
        <div><span class="register-number">08</span><span>PUBLIC SOURCE<br>ENGINES</span></div>
        <div><span class="register-number">40</span><span>CHAR COMMIT<br>IDENTITIES</span></div>
        <div class="register-claim"><span class="pink-rule"></span><p>No synthetic testimonials. No decorative metrics. Every claim terminates at a commit, a witness, and a downloadable receipt.</p></div>
      </section>

      <section class="vault" id="case-file" aria-labelledby="case-title">
        <aside class="case-rail">
          <div class="rail-heading">
            <span>CASE REGISTER</span><span>${String(filtered.length).padStart(2, "0")} / 12</span>
          </div>
          <div class="filters" role="group" aria-label="Filter cases">
            ${["all", "guarded", "bounded", "repaired"].map((filter) => `<button class="filter ${filter === activeFilter ? "is-active" : ""}" data-filter="${filter}">${filter}</button>`).join("")}
          </div>
          <div class="case-list">${filtered.map(caseRailItem).join("")}</div>
        </aside>

        <article class="case-file">
          <div class="file-topline">
            <span class="classification">PUBLIC / REPRODUCIBLE</span>
            <span>VERIFIED ${active.verifiedAt}</span>
            <span class="severity severity-${active.severity}">${active.severity} severity</span>
          </div>

          <header class="case-header">
            <div>
              <p>${active.caseNumber} / ${active.system.toUpperCase()}</p>
              <h2 id="case-title">${active.title}</h2>
            </div>
            <div class="disposition-stamp">${active.disposition}<small>${active.faultKind}</small></div>
          </header>

          <p class="case-summary">${active.summary}</p>

          <section class="evidence-board" aria-labelledby="causal-tape-title">
            <div class="board-title">
              <span id="causal-tape-title">CAUSAL TAPE</span>
              <span>SCRUB THE FAILURE →</span>
            </div>
            <div class="tape-track" style="--progress:${(activeStep / Math.max(active.timeline.length - 1, 1)) * 100}%">
              ${active.timeline.map(tapeStep).join("")}
            </div>
            <div class="tape-inspector" data-state="${step.state}">
              <span class="inspector-phase">${String(activeStep + 1).padStart(2, "0")} / ${step.phase}</span>
              <div><h3>${step.title}</h3><p>${step.detail}</p></div>
              <span class="state-lamp"><i></i>${step.state}</span>
            </div>
          </section>

          <div class="measurement-grid">
            ${active.metrics.map((metric) => `
              <div class="measurement">
                <span>${metric.label}</span>
                <div class="measurement-values"><strong>${metric.broken}</strong><i>→</i><b>${metric.guarded}</b></div>
                <small>${metric.unit} / broken → constrained</small>
              </div>`).join("")}
          </div>

          <div class="claim-grid">
            <section><span>TRIGGER</span><p>${active.trigger}</p></section>
            <section><span>OBSERVED</span><p>${active.observed}</p></section>
            <section><span>INVARIANT</span><p>${active.invariant}</p></section>
            <section><span>RESPONSE</span><p>${active.fix}</p></section>
          </div>

          <section class="receipt" aria-label="Failure receipt">
            <div class="receipt-paper">
              <div class="receipt-perforation"></div>
              <div class="receipt-head"><span>FAILURE RECEIPT</span><b>${active.caseNumber}</b></div>
              <dl>
                <div><dt>ENGINE</dt><dd>${active.engine}</dd></div>
                <div><dt>COMMIT</dt><dd><code>${active.commit.slice(0, 12)}</code></dd></div>
                <div><dt>WITNESS</dt><dd>${active.verification.result}</dd></div>
                <div><dt>COMMAND</dt><dd><code>${command.display}</code></dd></div>
              </dl>
              <div class="receipt-seal">${icon("seal")}<span>CONTENT<br>SEALED</span></div>
            </div>
            <div class="receipt-actions">
              <p>Self-contained JSON binds the complete capsule, source revision, allowlisted verification command, evidence URL, and SHA-256 content digest.</p>
              <a class="button button-primary" href="./receipts/${active.id}.receipt.json" download>${icon("download")} DOWNLOAD JSON RECEIPT</a>
              <a class="text-link" href="${evidenceUrl(active)}" target="_blank" rel="noreferrer">INSPECT TEST AT COMMIT ${icon("arrow")}</a>
              <button class="copy-command" data-copy="node bin/counterexample.mjs verify public/receipts/${active.id}.receipt.json">COPY LOCAL VERIFY COMMAND</button>
            </div>
          </section>

          <footer class="case-footer">
            <div><span>KNOWN LIMITS</span>${active.limits.map((limit) => `<p>${limit}</p>`).join("")}</div>
            <div class="tags">${active.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
          </footer>
        </article>
      </section>

      <section class="protocol" id="protocol" aria-labelledby="protocol-title">
        <div class="protocol-copy">
          <p class="eyebrow"><span>EXTERNAL INTAKE / CONSTRAINED</span></p>
          <h2 id="protocol-title">Bring a failure.<br><em>Bring the proof.</em></h2>
          <p>COUNTEREXAMPLE accepts minimized, reproducible failures—not opinions, exploit payloads, or arbitrary executables.</p>
          <a class="button button-primary" href="https://github.com/asp53826/counterexample/issues/new?template=counterexample.yml" target="_blank" rel="noreferrer">OPEN A SUBMISSION ${icon("arrow")}</a>
        </div>
        <ol class="protocol-steps">
          <li><span>01</span><div><b>Declare</b><p>Select an allowlisted engine, fault class, invariant, and exact public revision.</p></div></li>
          <li><span>02</span><div><b>Minimize</b><p>Reduce the failure to data, deterministic steps, and bounded evidence links.</p></div></li>
          <li><span>03</span><div><b>Validate</b><p>Schema, size, path, revision, and forbidden-field gates run before review.</p></div></li>
          <li><span>04</span><div><b>Admit</b><p>A maintainer reproduces it; CI issues the receipt only after the capsule lands.</p></div></li>
        </ol>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-mark">COUNTER<span>EXAMPLE</span><small>A public engineering failure museum.</small></div>
      <div><span>RELEASE</span><a href="https://github.com/asp53826/counterexample/releases/tag/v1.0.0">v1.0.0</a><a href="./receipts/MANIFEST.sha256">SHA-256 MANIFEST</a></div>
      <div><span>PROVENANCE</span><a href="https://github.com/asp53826/counterexample/attestations">GITHUB ATTESTATIONS</a><a href="./CITATION.cff">CITE THIS WORK</a></div>
      <div><span>MAINTAINER</span><a href="https://github.com/asp53826">AARYAN PATEL</a><a href="https://asp53826.github.io/">ENGINEERING PORTFOLIO</a></div>
    </footer>
  `;

  wireInteractions(active);
}

function wireInteractions(active: Capsule) {
  document.querySelectorAll<HTMLButtonElement>("[data-case]").forEach((button) => {
    button.addEventListener("click", () => {
      activeId = button.dataset.case ?? activeId;
      activeStep = 0;
      history.replaceState(null, "", `#${activeId}`);
      render();
      document.querySelector("#case-file")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
  document.querySelectorAll<HTMLButtonElement>("[data-step]").forEach((button) => {
    button.addEventListener("click", () => {
      activeStep = Number(button.dataset.step ?? 0);
      render();
      document.querySelector(".evidence-board")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });
  document.querySelectorAll<HTMLButtonElement>("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter ?? "all";
      render();
    });
  });
  const copy = document.querySelector<HTMLButtonElement>("[data-copy]");
  copy?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(copy.dataset.copy ?? "");
    copy.textContent = "COPIED / RUN FROM REPOSITORY ROOT";
    window.setTimeout(() => { copy.textContent = "COPY LOCAL VERIFY COMMAND"; }, 2400);
  });
  document.title = `${active.caseNumber}: ${active.title} — COUNTEREXAMPLE`;
}

window.addEventListener("hashchange", () => {
  const requested = location.hash.slice(1);
  if (capsules.some((capsule) => capsule.id === requested)) {
    activeId = requested;
    activeStep = 0;
    render();
  }
});

render();
