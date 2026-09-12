// Dialogue avec le Space Hugging Face qui heberge le modele.
//
// L'API Gradio fonctionne en deux temps : on soumet la question, elle rend un
// identifiant, puis on lit un flux d'evenements SSE sur cet identifiant. Chaque
// evenement porte la reponse COMPLETE connue a cet instant, pas seulement le
// morceau qui vient de s'ajouter : c'est pourquoi on remplace le texte a chaque
// etape plutot que de le concatener.
//
// `fetch` est injectable pour que ce module se teste sans reseau.

const SPACE_URL = 'https://valmtp3-chatbot-ia-cv.hf.space';

export const CHATBOT_API_URL = `${SPACE_URL}/gradio_api/call/generate_response`;

// Un Space endormi met une bonne minute a se reveiller. Le delai est remis a
// zero a chaque paquet recu : il protege du silence, pas de la longueur.
const DEFAULT_TIMEOUT_MS = 90000;

export const TIMEOUT_MESSAGE = 'Le chatbot met trop longtemps à répondre.';

/**
 * Lit un bloc d'evenement SSE et en tire le texte de reponse s'il y en a un.
 * Leve une erreur si le Space signale un echec.
 */
export const parseGradioEvent = (eventBlock) => {
  const lines = eventBlock.split(/\r?\n/);
  const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
  const dataText = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');

  if (event === 'error') {
    throw new Error('Erreur retournée par le Space Hugging Face');
  }

  if (!dataText || (event !== 'generating' && event !== 'complete')) {
    return { event, response: null };
  }

  const data = JSON.parse(dataText);
  const response = Array.isArray(data) ? data[0] : data;

  return { event, response: typeof response === 'string' ? response : null };
};

/**
 * Convertit la liste de messages affiches en l'historique attendu par le Space :
 * [[question, reponse], ...]. Le message d'accueil, qui n'a pas de question en
 * face, et une question encore sans reponse sont laisses de cote.
 *
 * Deux vocabulaires coexistent : deep-chat nomme ses messages `role: 'ai'` et
 * `text`, le reste du projet `role: 'bot'` et `content`. Les deux sont acceptes,
 * ce qui evite une couche de traduction pour deux noms de champs.
 */
export const buildHistory = (messages) => {
  const history = [];
  let pendingQuestion = null;

  for (const message of messages) {
    const text = message.content ?? message.text ?? '';

    if (message.role === 'user') {
      pendingQuestion = text;
    } else if (pendingQuestion !== null) {
      history.push([pendingQuestion, text]);
      pendingQuestion = null;
    }
  }

  return history;
};

const httpError = (status) => {
  const error = new Error(`Erreur HTTP ${status}`);
  error.status = status;
  return error;
};

/**
 * Pose une question au Space et suit sa reponse jusqu'au bout.
 *
 * @param {object} options
 * @param {string} options.message - la question de l'utilisateur.
 * @param {Array<[string, string]>} options.history
 * @param {(text: string) => void} options.onUpdate - recoit la reponse a chaque etape.
 * @param {typeof fetch} [options.fetchImpl]
 * @param {string} [options.apiUrl]
 * @param {number} [options.timeoutMs]
 * @returns {Promise<string>} la reponse complete.
 */
export const streamChatbotResponse = async ({
  message,
  history,
  onUpdate,
  fetchImpl = (...args) => globalThis.fetch(...args),
  apiUrl = CHATBOT_API_URL,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}) => {
  const controller = new AbortController();
  let timeoutId;

  const resetTimeout = () => {
    globalThis.clearTimeout(timeoutId);
    timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  };

  resetTimeout();

  try {
    const submitResponse = await fetchImpl(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [message, history] }),
      signal: controller.signal,
    });

    if (!submitResponse.ok) throw httpError(submitResponse.status);

    const { event_id: eventId } = await submitResponse.json();
    if (!eventId) throw new Error('Identifiant de réponse manquant');

    const streamResponse = await fetchImpl(`${apiUrl}/${eventId}`, { signal: controller.signal });

    if (!streamResponse.ok) throw httpError(streamResponse.status);
    if (!streamResponse.body) throw new Error('Streaming indisponible dans ce navigateur');

    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let finalResponse = '';
    let isComplete = false;

    const processEvent = (eventBlock) => {
      const { event, response } = parseGradioEvent(eventBlock);
      if (typeof response === 'string' && response.trim()) {
        finalResponse = response;
        onUpdate(response);
      }
      if (event === 'complete') isComplete = true;
    };

    while (!isComplete) {
      const { value, done } = await reader.read();
      if (done) break;

      resetTimeout();
      buffer += decoder.decode(value, { stream: true });

      // Un paquet reseau peut couper un evenement en deux : le dernier morceau
      // reste en attente du paquet suivant.
      const eventBlocks = buffer.split(/\r?\n\r?\n/);
      buffer = eventBlocks.pop() ?? '';
      for (const eventBlock of eventBlocks.filter(Boolean)) processEvent(eventBlock);
    }

    buffer += decoder.decode();
    if (buffer.trim()) processEvent(buffer.trim());

    if (!isComplete) throw new Error('Réponse incomplète du Space Hugging Face');
    if (!finalResponse.trim()) throw new Error('Réponse vide');

    return finalResponse;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(TIMEOUT_MESSAGE);
    throw error;
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
};
