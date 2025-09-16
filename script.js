import { API_KEY } from "./config.js";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// ==== DOM ELEMENTS ====
const chatboxContainer = document.getElementById("chatbox");
const chatboxForm = document.getElementById("chatbox-form");
const chatboxInput = document.getElementById("chatbox-input");
const sendBtn = document.getElementById("send-btn");

// ==== STATE ====
let userMessage = "";

// ==== HELPERS ====

// Create a message bubble
const createMessageElement = (content, classes) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", classes);
  messageElement.innerHTML = content;
  return messageElement;
};

// Scroll chat to bottom
const scrollToBottom = () => {
  chatboxContainer.scrollTop = chatboxContainer.scrollHeight;
};

// Render Markdown with Highlight.js
const renderMarkdownWithHighlight = (text) => {
  const html = marked.parse(text, {
    breaks: true,
  });

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Apply syntax highlighting
  tempDiv.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });

  return tempDiv.innerHTML;
};

// ==== API CALL ====
const fetchResponse = async (botMessageContainer) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: userMessage }],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "API error");

    const responseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "⚠️ No response from AI";

    botMessageContainer.innerHTML = `
      <div class="message-text">
        ${renderMarkdownWithHighlight(responseText)}
      </div>
    `;
  } catch (error) {
    console.error(error);
    botMessageContainer.innerHTML =
      '<span class="message-text">⚠️ Oops! Something went wrong.</span>';
  } finally {
    scrollToBottom();
  }
};

// ==== HANDLERS ====
const handleUserMessage = (e) => {
  e.preventDefault();
  userMessage = chatboxInput.value.trim();
  if (!userMessage) return;

  // Add user message
  const userMessageContainer = createMessageElement(
    `<span class="message-text">${userMessage}</span>`,
    "user-message"
  );
  chatboxContainer.appendChild(userMessageContainer);

  // Add bot loading message
  const botMessageContainer = createMessageElement(
    `<span class="message-text loading-dots"><span>•</span><span>•</span><span>•</span>`,
    "bot-message"
  );
  chatboxContainer.appendChild(botMessageContainer);

  scrollToBottom();
  chatboxInput.value = "";
  fetchResponse(botMessageContainer);
};

// ==== EVENT LISTENERS ====
chatboxForm.addEventListener("submit", handleUserMessage);

chatboxInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleUserMessage(e);
  }
});

sendBtn.addEventListener("click", handleUserMessage);
