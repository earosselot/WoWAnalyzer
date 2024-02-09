import aplCheck, { build, CheckResult, PlayerInfo } from 'parser/shared/metrics/apl';
import TALENTS from 'common/TALENTS/mage';
import {
  and,
  buffPresent,
  buffStacks,
  debuffMissing,
  debuffPresent,
  lastSpellCast,
  or,
} from 'parser/shared/metrics/apl/conditions';
import { AnyEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';

export const apl = build([
  {
    spell: TALENTS.FLURRY_TALENT,
    condition: and(
      debuffMissing(SPELLS.WINTERS_CHILL),
      or(
        lastSpellCast(TALENTS.GLACIAL_SPIKE_TALENT),
        lastSpellCast(SPELLS.FROSTBOLT),
        buffStacks(SPELLS.ICICLES_BUFF, { atLeast: 4, atMost: 4 }),
      ),
    ),
  },
  {
    spell: TALENTS.GLACIAL_SPIKE_TALENT,
    condition: buffStacks(SPELLS.ICICLES_BUFF, { atLeast: 5 }),
  },
  {
    spell: TALENTS.ICE_LANCE_TALENT,
    condition: or(
      debuffPresent(SPELLS.WINTERS_CHILL),
      buffPresent(SPELLS.FINGERS_OF_FROST_BUFF, 200),
    ),
  },
  SPELLS.FROSTBOLT,
]);

export const checkFrost = (events: AnyEvent[], info: PlayerInfo): CheckResult => {
  const check = aplCheck(apl);
  return check(events, info);
};

/**
 * Icy Veins
 * 1. Cast Flurry have just cast FB, or GS, or you have 4 Icicles before casting it.
 * 2. Glacial Spike if you are at 5 Icicles.
 * 3. Cast Ice Lance if Winter's Chill or Fingers of Frost.
 * 4. Cast Frostbolt.
 */
