document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "https://eel-notable-goshawk.ngrok-free.app"; // URL base parametrizada

    const newChatBtn = document.getElementById("new-chat-btn");
    const chatModal = document.getElementById("chat-modal");
    const startChatBtn = document.getElementById("start-chat-btn");
    const chatNameInput = document.getElementById("chat-name-input");
    const chatTitle = document.getElementById("chat-title");
    const chatList = document.getElementById("chat-list");

    // Modal oculto por defecto
    chatModal.style.display = 'none'; 

    newChatBtn.addEventListener("click", () => {
        chatModal.style.display = 'flex'; 
        chatNameInput.value = ""; 
        chatNameInput.focus(); 
    });

    // Función para crear o recuperar una conversación desde la API
    async function createConversation(chatName) {
        try {
            const response = await fetch(`${API_BASE_URL}/CreateOrGetConversacion/${encodeURIComponent(chatName)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            return await response.json(); // Retornar la respuesta en formato JSON
        } catch (error) {
            console.error("Error al crear la conversación:", error);
            return null;
        }
    }

    // Iniciar un chat cuando se ingrese el nombre y cerrar el modal
    startChatBtn.addEventListener("click", async () => {
        const chatName = chatNameInput.value.trim();
        if (chatName) {
            const data = await createConversation(chatName);
            if (data) {
                chatTitle.textContent = chatName; // Actualizar el título del chat

                // Agregar chat a la lista
                const chatItem = document.createElement("li");
                chatItem.textContent = chatName;
                chatItem.addEventListener("click", () => {
                    chatTitle.textContent = chatName;
                });
                chatList.appendChild(chatItem);

                // Ocultar el modal
                chatModal.style.display = 'none';
            }
        }
    });

    // Cerrar el modal si se hace clic fuera de la caja de entrada
    chatModal.addEventListener("click", (event) => {
        if (event.target === chatModal) {
            chatModal.style.display = 'none'; 
        }
    });
});
