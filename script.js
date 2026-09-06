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

const chatEl = document.getElementById("chat");
const formEl = document.getElementById("composer");
const inputEl = document.getElementById("messageInput");
const resetBtn = document.getElementById("resetBtn");

function addMessage(text, sender) {
  const bubble = document.createElement("div");
  bubble.className = "bubble " + sender;
  bubble.textContent = text;
  chatEl.appendChild(bubble);
  chatEl.scrollTop = chatEl.scrollHeight;
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
      body: JSON.stringify({ sessionId, message: text, secret: DEMO_SECRET, grupa })
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
    addMessage("Nie udało się uzyskać odpowiedzi. Spróbuj ponownie.", "ai error");
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
  chatEl.innerHTML = "";
  showWelcomeMessage();
});

showWelcomeMessage();
