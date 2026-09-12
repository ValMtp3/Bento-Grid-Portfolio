// Pont entre deep-chat et le Space Hugging Face.
//
// deep-chat gere l'affichage et garde la liste des messages ; ce module lui
// fournit le texte. Trois pieges, tous couverts par les tests :
//
//   1. En mode flux, deep-chat AJOUTE ce qu'on lui envoie a la bulle en cours.
//      Le Space, lui, renvoie a chaque etape la reponse complete connue. On
//      envoie donc la difference, jamais le cumul.
//   2. Tant que `onOpen` n'est pas appele, la bulle de chargement reste
//      affichee : il faut l'appeler avant le premier morceau de texte.
//   3. `onClose` doit etre appele dans tous les cas, erreur comprise, sinon le
//      bouton d'envoi reste bloque sur "stop".

import { buildHistory, streamChatbotResponse, TIMEOUT_MESSAGE } from './gradio.js';
import { neutralizeUnsafeLinks } from './safeLinks.js';
import { createTypewriter } from './typewriter.js';

const COLD_START_MESSAGE =
  'Le serveur démarre (Cold Boot). Veuillez réessayer dans quelques secondes.';
const GENERIC_ERROR_MESSAGE = 'Désolé, une erreur est survenue lors de la connexion.';
const MISSING_TOKEN_MESSAGE =
  "Veuillez patienter pendant la vérification de sécurité, puis renvoyez votre message.";

// Le detail technique reste dans la console : le visiteur recoit une phrase qui
// lui dit quoi faire, pas une trace reseau.
const errorMessageFor = (error) => {
  if (error?.status === 503) return COLD_START_MESSAGE;
  if (error?.message === TIMEOUT_MESSAGE) return TIMEOUT_MESSAGE;
  return GENERIC_ERROR_MESSAGE;
};

// Sert au suivi d'audience : la categorie de panne, jamais son message.
const errorKindFor = (error) => {
  if (error?.status === 503) return 'cold_start';
  if (error?.message === TIMEOUT_MESSAGE) return 'timeout';
  return 'request_failure';
};

const lastUserMessage = (messages) => {
  const last = [...messages].reverse().find((message) => message.role === 'user');
  return last?.text ?? last?.content ?? '';
};

/**
 * Construit la fonction attendue par `connect.handler` de deep-chat.
 *
 * @param {object} options
 * @param {Function} [options.streamResponse] - l'appel au Space, injectable pour les tests.
 * @param {object} [options.typewriterOptions] - minuteurs de la machine a ecrire.
 * @param {() => string | null} [options.getTurnstileToken] - jeton de verification Cloudflare.
 * @param {(kind: string) => void} [options.onError] - suivi d'audience.
 */
export const createChatHandler = ({
  streamResponse = streamChatbotResponse,
  typewriterOptions = {},
  getTurnstileToken = () => 'no-check',
  onError = () => {},
} = {}) => {
  return async (body, signals) => {
    const messages = body?.messages ?? [];
    const question = lastUserMessage(messages);

    let hasOpened = false;
    let emittedLength = 0;
    let receivedText = '';
    let isStopped = false;

    // Ouvre la bulle de reponse au premier texte : deep-chat garde sinon son
    // animation de chargement par-dessus.
    const emit = (text) => {
      if (!text) return;
      if (!hasOpened) {
        signals.onOpen();
        hasOpened = true;
      }
      signals.onResponse({ text });
    };

    const emitUpTo = (fullText) => {
      if (fullText.length <= emittedLength) return;
      emit(fullText.slice(emittedLength));
      emittedLength = fullText.length;
    };

    const typewriter = createTypewriter({
      onDisplay: (displayedText) => {
        if (isStopped) return;
        emitUpTo(displayedText);
      },
      ...typewriterOptions,
    });

    // Interruption volontaire : on pose d'un coup le texte deja produit par le
    // Space plutot que de le perdre, puis on cesse d'ecrire.
    signals.stopClicked.listener = () => {
      if (isStopped) return;
      isStopped = true;
      typewriter.cancel();
      emitUpTo(receivedText);
    };

    // Le jeton Cloudflare n'est pas encore la : on prefere le dire plutot que
    // de laisser partir une requete qui sera rejetee.
    if (!getTurnstileToken()) {
      emit(MISSING_TOKEN_MESSAGE);
      signals.onClose();
      return;
    }

    try {
      await streamResponse({
        message: question,
        history: buildHistory(messages.slice(0, -1)),
        onUpdate: (partialResponse) => {
          if (isStopped) return;
          // La reponse du modele n'est pas du contenu de confiance : deep-chat
          // rend le Markdown sans filtrer les schemas d'URL.
          receivedText = neutralizeUnsafeLinks(partialResponse);
          typewriter.push(receivedText);
        },
      });
      if (!isStopped) await typewriter.finish();
    } catch (error) {
      typewriter.cancel();
      if (!isStopped) {
        console.error('Erreur Chatbot:', error);
        onError(errorKindFor(error));
        // Un saut de ligne separe l'explication du texte deja ecrit, si le flux
        // s'est interrompu en cours de reponse.
        emit(emittedLength > 0 ? `\n\n${errorMessageFor(error)}` : errorMessageFor(error));
      }
    } finally {
      signals.onClose();
    }
  };
};
