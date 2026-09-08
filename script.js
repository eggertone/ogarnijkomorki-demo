// ======= JEDYNE MIEJSCE DO EDYCJI =======
// Wklej tu prawdziwy URL webhooka z n8n (Production URL nowego workflow dla
// Ogarnij Komórki), zanim opublikujesz stronę na GitHub Pages.
const WEBHOOK_URL = "https://amy145-20145.mikrus.cloud/webhook/6f5530e3-e2a5-4927-8b51-a4fe33a3ffc9";
// Musi być identyczny jak wartość w węźle "IF: sekret poprawny?" w n8n.
const DEMO_SECRET = "OGARNIJKOMORKI-DEMO-2026";
// =========================================

const WELCOME_MESSAGE =
  "Cześć! Powiedz, na jakim poziomie jesteś dziś z Excelem: dopiero zaczynasz, ogarniasz podstawy, czy szukasz czegoś bardziej zaawansowanego?";

function getGrupaFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("grupa") || "demo-publiczne";
}

let sessionId = "demo-ogarnijkomorki";
const grupa = getGrupaFromUrl();
let historiaRozmowy = [];

const chatEl = document.getElementById("chat");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("messageInput");
const resetBtn = document.getElementById("resetBtn");

function formatCzas() {
  const teraz = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return pad(teraz.getHours()) + ":" + pad(teraz.getMinutes()) + ":" + pad(teraz.getSeconds());
}

function formatujHistorieRozmowy() {
  return historiaRozmowy
    .map((wpis) => "[" + wpis.czas + "] " + (wpis.rola === "bot" ? "BOT" : "UŻYTKOWNIK") + ": " + wpis.tekst)
    .join("\n");
}

function addMessage(text, sender, zapiszWHistorii = true) {
  const bubble = document.createElement("div");
  bubble.className = "bubble " + sender;
  bubble.textContent = text;
  chatEl.appendChild(bubble);
  chatEl.scrollTop = chatEl.scrollHeight;

  if (zapiszWHistorii) {
    historiaRozmowy.push({
      rola: sender === "user" ? "uzytkownik" : "bot",
      tekst: text,
      czas: formatCzas()
    });
  }

  return bubble;
}

function addTyping() {
  const bubble = document.createElement("div");
  bubble.className = "bubble ai typing";
  bubble.textContent = "Piszę...";
  chatEl.appendChild(bubble);
  chatEl.scrollTop = chatEl.scrollHeight;
  return bubble;
}

function showWelcomeMessage() {
  addMessage(WELCOME_MESSAGE, "ai");
}

async function sendMessage(text) {
  addMessage(text, "user");
  const typingBubble = addTyping();

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        message: text,
        secret: DEMO_SECRET,
        grupa,
        historia_rozmowy: formatujHistorieRozmowy()
      })
    });

    if (!response.ok) {
      throw new Error("Zła odpowiedź serwera: " + response.status);
    }

    const data = await response.json();
    typingBubble.remove();
    addMessage(data.reply || "Brak odpowiedzi.", "ai");
  } catch (err) {
    console.error("Błąd komunikacji z chatbotem:", err);
    typingBubble.remove();
    addMessage("Nie udało się uzyskać odpowiedzi. Spróbuj ponownie.", "ai error", false);
  }
}

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = "";
  sendMessage(text);
});

resetBtn.addEventListener("click", () => {
  sessionId = "demo-" + Math.random().toString(36).slice(2, 10);
  historiaRozmowy = [];
  chatEl.innerHTML = "";
  showWelcomeMessage();
});

showWelcomeMessage();
