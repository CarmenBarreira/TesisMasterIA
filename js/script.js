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

    let currentConversation = null;

    chatModal.style.display = 'none';

    newChatBtn.addEventListener("click", () => {
        chatModal.style.display = 'flex';
        chatNameInput.value = "";
        chatNameInput.focus();
    });


    async function createConversation(chatName) {
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

                // Contenedor del chat en el HTML
                const chatContainer = document.getElementById("chat-messages");

                conversacion.forEach(item => {
                    // Crear el elemento para la pregunta
                    const preguntaElemento = document.createElement("div");
                    preguntaElemento.textContent = item.Pregunta;
                    preguntaElemento.classList.add("mensaje", "pregunta");

                    // Crear el elemento para la respuesta
                    const respuestaElemento = document.createElement("div");
                    respuestaElemento.textContent = item.Resultados;
                    respuestaElemento.classList.add("mensaje", "respuesta");

                    // Agregar al contenedor del chat
                    chatContainer.appendChild(preguntaElemento);
                    chatContainer.appendChild(respuestaElemento);
                });
            }
        } catch (error) {
            console.error("Error en la conversación:", error);
        }
    }


    function parseConversation(conversationText) {
        console.log("Texto crudo antes de procesar:", conversationText);

        // Reemplazar \\n por saltos de línea reales
        conversationText = conversationText.replace(/\\n/g, "\n");
        console.log("Texto limpio:", conversationText);

        const mensajes = [];
        const regex = /Pregunta:\s*(.*?)\s*Respuesta.*?:\s*(.*?)(?=\s*Pregunta:|$)/gs;

        let match;
        while ((match = regex.exec(conversationText)) !== null) {
            const pregunta = match[1].trim();
            const respuesta = match[2].trim();
            mensajes.push({ pregunta, respuesta });
        }

        console.log("Mensajes extraídos:", mensajes);
        return mensajes;
    }


    // Función para agregar mensajes al chat
    function appendMessage(msg, side) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", side); // Asegúrate de que tenga las clases correctas

        // Verificamos el tipo de contenido
        console.log("Mensaje a mostrar:", msg);

        // Si el mensaje es un objeto, extraemos la pregunta y respuesta
        if (msg.pregunta && msg.respuesta) {
            messageElement.innerHTML = `
                <strong>Pregunta:</strong> ${msg.pregunta} <br>
                <strong>Respuesta:</strong> ${msg.respuesta}
            `;
        } else if (typeof msg === 'string') {
            // Si el mensaje es una cadena de texto
            messageElement.textContent = msg;
        } else {
            // Si el mensaje no es lo que esperábamos, lo mostramos como un objeto
            messageElement.textContent = JSON.stringify(msg);
        }

        // Verificamos si el mensaje fue creado correctamente
        console.log("Elemento de mensaje creado:", messageElement);

        // Agregar el mensaje al contenedor de mensajes
        chatMessages.appendChild(messageElement);
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
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

        // Si la conversación no existe en la lista, la agregamos
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

        // Extraemos los mensajes correctamente
        const mensajes = extractMessages(data.mensajes);
        console.log("Mensajes extraídos:", mensajes);

        // Mostramos los mensajes en pantalla
        showMessages(mensajes);

        chatModal.style.display = 'none';
    });



    // Función para extraer preguntas y respuestas de la conversación
    function extractMessages(mensajes) {
        if (Array.isArray(mensajes)) {
            // Mapeamos los mensajes para extraer pregunta y respuesta.
            return mensajes.map(msg => {
                // Verificamos que las propiedades 'pregunta' y 'respuesta' existan.
                if (msg.pregunta && msg.respuesta) {
                    return {
                        pregunta: msg.pregunta,
                        respuesta: msg.respuesta
                    };
                }
                // Si no tiene esas propiedades, lo ignoramos.
                return null;
            }).filter(msg => msg !== null); // Filtramos los valores nulos.
        }

        // Si los mensajes no están en formato array, devolvemos un array vacío.
        return [];
    }

    function showMessages(mensajes) {
        const chatMessages = document.getElementById("chat-messages");

        // Limpiar el contenedor antes de agregar los nuevos mensajes
        chatMessages.innerHTML = "";

        // Recorremos los mensajes y los agregamos al contenedor
        mensajes.forEach(msg => {
            // Crear un div para el mensaje
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message");

            // Dependiendo de si es una pregunta o una respuesta, le damos un estilo
            if (msg.pregunta) {
                messageDiv.classList.add("question");
                messageDiv.textContent = msg.pregunta;
            }

            if (msg.respuesta) {
                messageDiv.classList.add("answer");
                messageDiv.textContent = msg.respuesta;
            }

            // Añadir el mensaje al contenedor
            chatMessages.appendChild(messageDiv);
        });
    }


    async function loadChatMessages(chatName) {
        const data = await createConversation(chatName);
        if (!data) return;

        // Extraemos los mensajes
        const mensajes = extractMessages(data.mensajes);
        console.log("Mensajes extraídos:", mensajes);

        // Mostramos los mensajes en la página
        showMessages(mensajes);
    }


    sendBtn.addEventListener("click", async () => {
        const message = messageInput.value.trim();
        if (!message || !currentConversation) {
            showError("El mensaje no puede estar vacío.");
            return;
        }

        appendMessage(message, "right");  // Mostrar mensaje del usuario
        messageInput.value = "";

        try {
            const requestBody = JSON.stringify({ mensaje: message, conversacion: currentConversation });
            console.log("Enviando a la API:", requestBody);

            const response = await fetch(`${API_BASE_URL}/ConversarLlaMa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: requestBody
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error API: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            console.log("Respuesta de la API:", data);

            // Procesar la respuesta para extraer preguntas y respuestas
            const mensajes = procesarRespuestaApi(data.conversacion);

            mensajes.forEach(({ pregunta, respuesta }) => {
                appendMessage(pregunta, "right");  // Mostrar pregunta del usuario
                appendMessage(respuesta, "left");  // Mostrar respuesta del bot
            });

        } catch (error) {
            console.error("Error al enviar mensaje:", error);
            showError("No se pudo enviar el mensaje.");
        }
    });

    function showError(message) {
        const errorDiv = document.getElementById("error-message");
        const errorText = document.getElementById("error-text");
        errorText.textContent = message;
        errorDiv.style.display = "block";
    }
});
