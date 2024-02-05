import aplCheck, { build, CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/mage';
import {
  and,
  buffStacks,
  lastSpellCast,
  not,
  or,
  spellAvailable,
} from 'parser/shared/metrics/apl/conditions';
import { AnyEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

export const apl = build([
  {
    spell: TALENTS.COMET_STORM_TALENT,
    condition: lastSpellCast(TALENTS.FLURRY_TALENT),
  },
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: or(
      lastSpellCast(TALENTS.GLACIAL_SPIKE_TALENT),
      lastSpellCast(SPELLS.FROSTBOLT),
      buffStacks(SPELLS.MASTERY_ICICLES, { atLeast: 4 }),
    ),
  },
  {
    spell: TALENTS.RAY_OF_FROST_TALENT,
    condition: and(
      not(lastSpellCast(TALENTS.FLURRY_TALENT)),
      or(lastSpellCast(TALENTS.GLACIAL_SPIKE_TALENT), lastSpellCast(TALENTS.ICE_LANCE_TALENT)),
      buffStacks(SPELLS.WINTERS_CHILL, { atMost: 1 }),
      // todo: esto creo que esta tomando el instante que tiene 1 carga despues de que pega el precast
    ),
  },
  {
    spell: TALENTS.GLACIAL_SPIKE_TALENT,
    // condition: and(
    //   hasTalent(TALENTS.GLACIAL_SPIKE_TALENT),
    //   and(
    //     buffStacks(SPELLS.MASTERY_ICICLES, { atLeast: 5 } ), //todo: esto de los stack rompe la apl
    //     or(debuffPresent(SPELLS.WINTERS_CHILL), spellAvailable(TALENTS.FLURRY_TALENT))
    //   ))
    condition: buffStacks(SPELLS.MASTERY_ICICLES, { atLeast: 5 }),
  },
  {
    spell: TALENTS.FROZEN_ORB_TALENT,
    condition: not(spellAvailable(TALENTS.RAY_OF_FROST_TALENT)),
  },
  // buff.icicles.react=5&(action.flurry.cooldown_react|remaining_winters_chill)
]);

export const checkFrost = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl);
  return check(events, info);
};

/**
 * WC
 * 1. CS
 * 2. Ray of Frost (1 carga)
 * 3. GS (5 icicles)
 * 4. Orb (2 > FoF y RoF en CD)
 * 5. SP (CDs...)
 * 4. IL
 *
 * No WC
 * 2. GS (5icicles + flurry disponible)
 * 1. IL (FoF)
 * 1. Flurry (4 icicles o precast)
 * 2. GS (5 icicles)
 * 3.
 * 4.
 * 5.
 *
 */
