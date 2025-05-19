
document.addEventListener("DOMContentLoaded", () => {
    //const API_BASE_URL = "https://eel-notable-goshawk.ngrok-free.app"; //DESA nico
    const API_BASE_URL = "https://vital-strongly-viper.ngrok-free.app"; //PROD
    //const API_BASE_URL = "https://firm-lively-sheepdog.ngrok-free.app"; //carmen 

    const newChatBtn = document.getElementById("new-chat-btn");
    const chatModal = document.getElementById("chat-modal");
    const startChatBtn = document.getElementById("start-chat-btn");
    const chatNameInput = document.getElementById("chat-name-input");
    const chatTitle = document.getElementById("chat-title");
    const chatList = document.getElementById("chat-list");
    const sendBtnMistral = document.getElementById("send-btn-mistral");
    const sendBtnLlama = document.getElementById("send-btn-llama");
    const messageInput = document.getElementById("message-input");
    const chatMessages = document.getElementById("chat-messages");
    const conversationList = document.getElementById('conversation-list');

    let currentConversation = null;

    chatModal.style.display = 'none';

    const loader = document.getElementById("loading-overlay");
    loader.style.opacity = "0";
    loader.style.visibility = "hidden";

    newChatBtn.addEventListener("click", () => {

        fetch(API_BASE_URL, { method: 'GET' })
            .then(response => {
                chatModal.classList.remove("hidden");
                chatModal.classList.add("modal-visible");
                chatNameInput.value = "";
                chatNameInput.focus();
                chatMessages.innerHTML = "";
            })
            .catch(error => {
                showError("No se pudo conectar con la API. Contactese con el administrador del sistema", "error");
            });
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

            if (data.mensaje === "Conversación encontrada.") {

                if (data.conversacion) {
                    document.getElementById('chat-modal').style.display = 'none';

                    const conversacion = data.conversacion;

                    const chatContainer = document.getElementById("chat-messages");
                    chatMessages.innerHTML = "";


                    if (conversacion.length === 0) {
                        showError("No hay mensajes en esta conversación.", "warning");

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
                    chatTitle.textContent = chatName;
                }
            }
            else {
                document.getElementById('chat-modal').style.display = 'none';

                const chatName = data.conversacion_id;
                showError("No hay mensajes en esta conversación.", "warning");

                addConversationToSidebar(chatName);
                chatTitle.textContent = chatName;
            }

        } catch (error) {
            console.log("Error en la conversación:");
        }

        closeModal();
    }

    startChatBtn.addEventListener("click", async () => {
        clearError();
        const chatName = chatNameInput.value.trim();
        if (!chatName) return;

        const data = await createConversation(chatName);
        if (!data) return;

        currentConversation = chatName;
        chatTitle.textContent = chatName;

        // Verificamos que el contenedor de mensajes exista
        const chatMessages = document.getElementById("chat-messages");
        if (!chatMessages) {
            console.log("Elemento con id 'chat-messages' no encontrado en el DOM");
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
        currentConversation = chatName;

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

    function showError(message, type = "error", autoClear = false) {
        const errorDiv = document.getElementById("error-message");
        const errorText = document.getElementById("error-text");
        const errorType = document.getElementById("error-type");

        errorText.textContent = message;

        if (type === "warning") {
            // Estilo para el warning
            errorDiv.style.backgroundColor = "rgb(255, 255, 179)"; // amarillo mostaza para warning
            errorDiv.style.border = "1px solid rgb(255, 223, 102)"; // borde amarillo mostaza
            errorText.style.color = "black";
            errorType.textContent = "Advertencia:";
        } else {
            // Estilo para el error
            errorDiv.style.backgroundColor = "rgb(248, 215, 218)"; // fondo rosa para error
            errorDiv.style.border = "1px solid rgb(245, 198, 203)"; // borde rosa claro
            errorText.style.color = "rgb(114, 28, 36)"; // rojo oscuro para el texto
            errorType.textContent = "Error:";
        }

        errorDiv.style.display = "block"; // Hacer visible el div de error

    }

    function clearError() {
        const errorDiv = document.getElementById("error-message");
        const errorText = document.getElementById("error-text");

        errorText.textContent = "";
        errorDiv.style.display = "none";

    }

    function appendMessage(msg, side) {

        const messageElement = document.createElement("div");
        messageElement.classList.add("message", side);

        console.log("Mensaje a mostrar:", msg);

        // Si el mensaje es un objeto, extraemos la pregunta y respuesta
        if (msg.pregunta && msg.respuesta) {
            const respuestaConSaltos = msg.respuesta.replace(/\n/g, "<br>");
            messageElement.innerHTML = `
            <strong>Pregunta:</strong> ${msg.pregunta} <br>
            <strong>Respuesta:</strong> ${respuestaConSaltos}
        `;

        } else if (typeof msg === 'string') {
            messageElement.textContent = msg;
        } else {
            messageElement.textContent = JSON.stringify(msg);
        }

        console.log("Elemento de mensaje creado:", messageElement);

        chatMessages.appendChild(messageElement);
    }

    function showLoader() {
        const loader = document.getElementById("loading-overlay");
        loader.style.opacity = "1";
        loader.style.visibility = "visible";
    }

    function hideLoader() {
        const loader = document.getElementById("loading-overlay");
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
    }

    sendBtnMistral.addEventListener("click", async () => {
        clearError();

        const message = messageInput.value.trim();
        currentConversation = chatTitle.textContent;

        // Validaciones antes de llamar a la API
        if (!message) {
            showError("El mensaje no puede estar vacío.", "warning");
            return;
        }

        if (!currentConversation) {
            showError("No se ha seleccionado ninguna conversación.", "error");
            return;
        }

        // Comienza la interacción con el chat
        showLoader();
        appendMessage(message, "pregunta");
        messageInput.value = "";

        try {
            const requestBody = JSON.stringify({
                mensaje: message,
                conversacion: currentConversation
            });

            const responseMistral = await fetch(`${API_BASE_URL}/ConversarMistral`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: requestBody
            });

            if (!responseMistral.ok) {
                throw new Error("Error en ConversarMistral. Error: " + responseMistral.status);
            }

            const dataMistral = await responseMistral.json();
            appendMessage(`${dataMistral.Resultados}`, "respuesta");

            // Resumen de la conversación
           /* try {
                const resumen = await fetch(`${API_BASE_URL}/ResumirConversacion?id=${currentConversation}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });

                if (!resumen.ok) {
                    throw new Error("Error al guardar resumen.  Error: " + resumen.status);
                }
            } catch (error) {
                showError("No se pudo guardar resumen. Contacte al administrador.", "error");
                console.error(error);
            }*/

        } catch (error) {
            showError("Hubo un error en la comunicación con el servidor. Contacte al administrador.", "error");
            console.error(error);
        } finally {
            hideLoader();
        }
    });


    sendBtnLlama.addEventListener("click", async () => {
        clearError();

        const message = messageInput.value.trim();
        currentConversation = chatTitle.textContent;

        if (!message) {
            showError("El mensaje no puede estar vacío.", "warning");
            return;
        }

        if (!currentConversation) {
            showError("No se ha seleccionado ninguna conversación.", "warning");
            return;
        }

        showLoader();

        appendMessage(message, "pregunta");
        messageInput.value = "";

        try {
            const requestBody = JSON.stringify({
                mensaje: message,
                conversacion: currentConversation
            });

            const responseLlama = await fetch(`${API_BASE_URL}/ConversarLlaMa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: requestBody
            });

            if (!responseLlama.ok) {
                throw new Error("Error en ConversarLlaMa. Error: " + responseLlama.status);
            }

            const dataLlama = await responseLlama.json();
            appendMessage(`${dataLlama.Resultados}`, "respuesta");

            // Intentar guardar resumen
           /* try {
                const resumen = await fetch(`${API_BASE_URL}/ResumirConversacion?id=${currentConversation}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                });

                if (!resumen.ok) {
                    throw new Error("Error al guardar resumen. Error: " + resumen.status);
                }
            } catch (error) {
                showError("No se pudo guardar resumen. Contacte al administrador del sistema.", "error");
                console.error(error);
            }*/

        } catch (error) {
            showError("Hubo un error en la comunicación con el servidor. Contacte al administrador del sistema.", "error");
            console.error(error);
        } finally {
            hideLoader();
        }
    });


});