// Les regles du formulaire de contact vivent hors du composant pour etre
// testables sans navigateur : champs requis, format d'email et plafonds de
// longueur, qui evitent qu'un envoi geant parte vers EmailJS.

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CONTACT_LIMITS, validateContact } from './contactForm.js';

const validValues = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  subject: 'Une question',
  message: 'Bonjour, je voulais vous ecrire.',
};

describe('validateContact', () => {
  it('ne renvoie aucune erreur pour un formulaire complet', () => {
    assert.deepEqual(validateContact(validValues), {});
  });

  it('signale chaque champ vide', () => {
    const errors = validateContact({ name: '', email: '', subject: '', message: '' });
    assert.deepEqual(Object.keys(errors).sort(), ['email', 'message', 'name', 'subject']);
  });

  it('considere un champ fait uniquement d espaces comme vide', () => {
    const errors = validateContact({ ...validValues, name: '   ' });
    assert.equal(errors.name, 'Le nom est requis.');
  });

  it('refuse un email sans domaine', () => {
    const errors = validateContact({ ...validValues, email: 'ada@' });
    assert.equal(errors.email, 'Un email valide est requis.');
  });

  // novalidate coupe le controle natif de type="email" : la regle doit refuser
  // seule ce que le navigateur refusait, a commencer par plusieurs adresses.
  for (const email of ['a@b.co, x@y.co', 'jean dupont a@b.co', 'a b@c.fr', 'a@@b.co', 'a@b.co x']) {
    it(`refuse l email "${email}"`, () => {
      assert.equal(validateContact({ ...validValues, email }).email, 'Un email valide est requis.');
    });
  }

  for (const [field, limit] of Object.entries(CONTACT_LIMITS)) {
    it(`accepte ${field} a exactement ${limit} caracteres`, () => {
      const value = field === 'email' ? `${'a'.repeat(limit - 12)}@example.com` : 'a'.repeat(limit);
      assert.equal(value.length, limit);
      assert.equal(validateContact({ ...validValues, [field]: value })[field], undefined);
    });

    it(`refuse ${field} au-dela de ${limit} caracteres`, () => {
      const value =
        field === 'email' ? `${'a'.repeat(limit - 11)}@example.com` : 'a'.repeat(limit + 1);
      assert.equal(value.length, limit + 1);
      assert.match(validateContact({ ...validValues, [field]: value })[field], /caract/);
    });
  }

  it('ne modifie pas l objet recu', () => {
    const values = { ...validValues, name: '' };
    const snapshot = { ...values };
    validateContact(values);
    assert.deepEqual(values, snapshot);
  });
});

describe('CONTACT_LIMITS', () => {
  it('fixe les plafonds valides par le proprietaire du site', () => {
    assert.deepEqual(CONTACT_LIMITS, { name: 100, email: 254, subject: 150, message: 5000 });
  });
});
