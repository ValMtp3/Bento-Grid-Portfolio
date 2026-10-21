// Regles du formulaire de contact, sorties du composant pour etre testees.
// Les plafonds bornent ce qui part vers EmailJS : le formulaire n'a aucun
// serveur a lui, c'est le seul endroit ou limiter la taille d'un envoi.

export const CONTACT_LIMITS = Object.freeze({
  name: 100,
  // Longueur maximale d'une adresse email (RFC 5321).
  email: 254,
  subject: 150,
  message: 5000,
});

// Ancree du debut a la fin : le formulaire est en novalidate, cette regle
// remplace le controle natif du navigateur. Une seule adresse, sans espace.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RULES = {
  name: { required: 'Le nom est requis.' },
  email: { required: 'Un email valide est requis.', isValid: (value) => EMAIL_PATTERN.test(value) },
  subject: { required: 'Le sujet est requis.' },
  message: { required: 'Le message est requis.' },
};

/**
 * Valide les valeurs du formulaire, une fois les espaces de bord retires.
 *
 * @param {{ name: string, email: string, subject: string, message: string }} values
 * @returns {Record<string, string>} un message par champ en erreur, vide si tout est bon.
 */
export const validateContact = (values) => {
  const errors = {};

  for (const [field, { required, isValid }] of Object.entries(RULES)) {
    const value = (values[field] ?? '').trim();
    const limit = CONTACT_LIMITS[field];

    if (!value || (isValid && !isValid(value))) {
      errors[field] = required;
    } else if (value.length > limit) {
      errors[field] = `${limit} caractères maximum.`;
    }
  }

  return errors;
};
