// Staking natif Solana.
//
// Les fonds stakes ne sont pas sur l'adresse du wallet mais dans des comptes
// separes, invisibles pour getBalance. Sans cette lecture, un portefeuille
// majoritairement stake apparaitrait presque vide.
//
// Le staking liquide (mSOL, jitoSOL, bSOL) ne passe pas par ici : ce sont des
// jetons SPL ordinaires, deja lus avec les autres. Les deux sources sont
// disjointes, elles s'additionnent sans double comptage.

const LAMPORTS_PER_SOL = 1_000_000_000;

// Sentinelle du protocole signifiant "aucune desactivation programmee".
export const U64_MAX = 18446744073709551615n;

/**
 * Position du proprietaire des fonds dans la structure d'un compte de stake.
 *
 * A ne pas confondre avec le "staker", a l'offset 12, qui n'est que le
 * gestionnaire de la delegation : les interfaces de staking y placent leur
 * propre programme. Filtrer sur 12 ramene zero compte sur ces wallets, alors
 * que les fonds sont bien la.
 */
export const WITHDRAWER_OFFSET = 44;

export const STAKE_PROGRAM = 'Stake11111111111111111111111111111111111111';

const toBigInt = (value) => {
  try {
    return BigInt(value);
  } catch {
    return 0n;
  }
};

/**
 * Totalise les comptes de stake, repartis par etat.
 *
 * Le montant lu est account.lamports, jamais delegation.stake : ce dernier
 * n'est pas remis a zero apres un retrait et garde indefiniment sa valeur
 * historique. Un compte vide peut ainsi afficher 50 000 SOL delegues.
 */
export const sumStakeAccounts = (accounts, epoch) => {
  const totals = { active: 0, activating: 0, deactivating: 0, inactive: 0, undelegated: 0 };
  const currentEpoch = toBigInt(epoch);

  for (const entry of Array.isArray(accounts) ? accounts : []) {
    const account = entry?.account;
    const lamports = Number(account?.lamports);
    if (!Number.isFinite(lamports) || lamports <= 0) continue;

    const sol = lamports / LAMPORTS_PER_SOL;
    const parsed = account?.data?.parsed;

    if (parsed?.type !== 'delegated') {
      totals.undelegated += sol;
      continue;
    }

    const delegation = parsed?.info?.stake?.delegation ?? {};
    const activation = toBigInt(delegation.activationEpoch);
    const deactivation = toBigInt(delegation.deactivationEpoch);

    if (deactivation !== U64_MAX && deactivation < currentEpoch) totals.inactive += sol;
    else if (deactivation !== U64_MAX) totals.deactivating += sol;
    else if (activation >= currentEpoch) totals.activating += sol;
    else totals.active += sol;
  }

  return {
    ...totals,
    total: Object.values(totals).reduce((sum, value) => sum + value, 0),
  };
};
