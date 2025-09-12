import { API_KEY } from "./config.js";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

/* ==== DOM ELEMENTS ==== */
const sendBtn = document.getElementById("send-btn");
const attachBtn = document.getElementById("attach-btn");
const chatboxInput = document.getElementById("chatbox-input");
const chatboxContainer = document.getElementById("chatbox");
const fileInput = document.getElementById("file-input");

const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};

/* ==== FUNCTIONS ==== */
const createMessageElement = (content, classes) => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", classes);
  messageElement.innerHTML = content;
  return messageElement;
};

const getUserRequest = async (botMessageContainer) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: userData.message,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error.message);
    // get Gemini's response
    const responseText = data.candidates[0].content.parts[0].text.trim();
    console.log(responseText);

    // Remove thinking animation and show the final message
    botMessageContainer.innerHTML = ""; // clear the bot container
    const botText = document.createElement("span");
    botText.classList.add("message-text");
    botText.textContent = responseText;
    botMessageContainer.appendChild(botText);
  } catch (error) {
    console.log(error);
    botMessageContainer.innerHTML = ""; // clear thinking
    const errorText = document.createElement("span");
    errorText.classList.add("message-text");
    errorText.textContent = "Oops! Something went wrong.";
    botMessageContainer.appendChild(errorText);
  }
};

const handleUserMessage = (e) => {
  e.preventDefault();
  const userMessage = chatboxInput.value.trim();
  if (!userMessage) return;
  userData.message = userMessage;
  chatboxInput.value = "";

  const userMessageContainer = createMessageElement(
    `<span class="message-text">${userData.message}</span>`,
    "user-message"
  );
  chatboxContainer.appendChild(userMessageContainer);

  // Display bot thinking animation
  const botMessageContainer = createMessageElement(
    `<div class="bot-thinking">
        <span></span><span></span><span></span>
     </div>`,
    "bot-message"
  );
  chatboxContainer.appendChild(botMessageContainer);

  // Scroll to bottom
  chatboxContainer.scrollTop = chatboxContainer.scrollHeight;
  // Call Gemini API
  getUserRequest(botMessageContainer);
};

/* ==== EVENT LISTENERS ==== */
chatboxInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleUserMessage(e);
});
sendBtn.addEventListener("click", (e) => handleUserMessage(e));

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64String = e.target.result.split(",")[1];
    userData.file = {
      data: base64String,
      mime_type: file.type,
    };
    fileInput.value = "";
  };

  reader.readAsDataURL(file);
});

attachBtn.addEventListener("click", () => fileInput.click());
