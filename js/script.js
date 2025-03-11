
document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "https://eel-notable-goshawk.ngrok-free.app";

    const newChatBtn = document.getElementById("new-chat-btn");
    const chatModal = document.getElementById("chat-modal");
    const startChatBtn = document.getElementById("start-chat-btn");
    const chatNameInput = document.getElementById("chat-name-input");
    const chatTitle = document.getElementById("chat-title");
    const chatList = document.getElementById("chat-list");
    const sendBtn = document.getElementById("send-btn");
    const messageInput = document.getElementById("message-input");
    const chatMessages = document.getElementById("chat-messages");
    const conversationList = document.getElementById('conversation-list');

    let currentConversation = null;

    chatModal.style.display = 'none';

    newChatBtn.addEventListener("click", () => {
        chatModal.classList.remove("hidden");
        chatModal.classList.add("modal-visible");
        chatNameInput.value = "";
        chatNameInput.focus();
        chatMessages.innerHTML = "";

    });

    function closeModal() {
        chatModal.classList.remove("modal-visible");
        chatModal.classList.add("hidden");
        chatModal.style.display = 'none';
    }

    function addConversationToSidebar(chatName) {

        const sidebarList = document.getElementById('conversation-list');

        if (!sidebarList) {
            console.error("No se encontró #conversation-list en el DOM.");
            return;
        }

        if ([...sidebarList.children].some(li => li.textContent === chatName)) {
            return;
        }

        const listItem = document.createElement('li');
        listItem.textContent = chatName;
        listItem.classList.add('sidebar-item');

        listItem.addEventListener('click', () => {
            createConversation(chatName);
        });

        sidebarList.appendChild(listItem);

    }
    async function createConversation(chatName) {
        chatMessages.innerHTML = "";
        try {

            const response = await fetch(`${API_BASE_URL}/CreateOrGetConversacion/${encodeURIComponent(chatName)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mensaje: "Iniciar conversación" })
            });

            const data = await response.json();

            if (data.conversacion) {
                document.getElementById('chat-modal').style.display = 'none';

                const conversacion = JSON.parse(data.conversacion);

                const chatContainer = document.getElementById("chat-messages");
                chatMessages.innerHTML = "";


                if (conversacion.length === 0) {
                    // Mostrar un mensaje si la conversación está vacía

                    const noMessagesElement = document.createElement("div");
                    noMessagesElement.textContent = "No hay mensajes en esta conversación.";
                    noMessagesElement.classList.add("no-messages");
                    chatContainer.appendChild(noMessagesElement);
                } else {
                    conversacion.forEach(item => {
                        // Crear el elemento para la pregunta
                        const preguntaElemento = document.createElement("div");
                        preguntaElemento.textContent = item.Pregunta;
                        preguntaElemento.classList.add("mensaje", "pregunta");

                        // Crear el elemento para la respuesta
                        const respuestaElemento = document.createElement("div");
                        respuestaElemento.textContent = item.Resultados;
                        respuestaElemento.classList.add("mensaje", "respuesta");

                        chatContainer.appendChild(preguntaElemento);
                        chatContainer.appendChild(respuestaElemento);
                    });
                }
                addConversationToSidebar(chatName);
            }

        } catch (error) {
            console.error("Error en la conversación:", error);
        }

        closeModal();
    }

    startChatBtn.addEventListener("click", async () => {
        const chatName = chatNameInput.value.trim();
        if (!chatName) return;

        const data = await createConversation(chatName);
        if (!data) return;

        currentConversation = chatName;
        chatTitle.textContent = chatName;

        // Verificamos que el contenedor de mensajes exista
        const chatMessages = document.getElementById("chat-messages");
        if (!chatMessages) {
            console.error("Elemento con id 'chat-messages' no encontrado en el DOM");
            return;
        }

        chatMessages.innerHTML = "";

        if (!document.querySelector(`li[data-chat='${chatName}']`)) {
            const chatItem = document.createElement("li");
            chatItem.textContent = chatName;
            chatItem.dataset.chat = chatName;
            chatItem.addEventListener("click", () => {
                chatTitle.textContent = chatName;
                loadChatMessages(chatName);
            });
            chatList.appendChild(chatItem);
        }

        const mensajes = extractMessages(data.mensajes);
        console.log("Mensajes extraídos:", mensajes);

        // Mostramos los mensajes en pantalla
        showMessages(mensajes);

        chatModal.addEventListener("click", (event) => {
            if (event.target === chatModal) {
                closeModal();
            }
        });
    });

    chatModal.addEventListener("click", (event) => {
        if (event.target === chatModal) {
            closeModal();
        }
    });

    conversationList.addEventListener("click", (event) => {
        const selectedChat = event.target.closest("li");
        if (!selectedChat) return;

        const chatName = selectedChat.textContent;
        currentConversation = chatName;
        chatTitle.textContent = chatName;

        chatMessages.innerHTML = "";

        createConversation(chatName);
    });

});