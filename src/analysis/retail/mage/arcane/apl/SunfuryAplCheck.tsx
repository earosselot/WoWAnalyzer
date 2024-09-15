import aplCheck, { build } from 'parser/shared/metrics/apl';
import * as cnd from 'parser/shared/metrics/apl/conditions';
import TALENTS from 'common/TALENTS/mage';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/*
* Conditions

A. CCx3
B. ASoul
C. NPx1
D. NPx2
E. CC
F. 4 ACharges
G. BoP or GI or Intu
H. Casting AB
I. NP

APL
1. AM if A
2. ABr if B
3. ABr if F and ( (C and H and G) or (not H and G and I) or (not E and not I and G))
4. AB if I
5. AM if E
6. AB if mana
7. ABr
* */

const AthreeClearcasting = cnd.buffStacks(SPELLS.CLEARCASTING_ARCANE, { atLeast: 3 });
const BarcaneSoulActive = cnd.buffPresent(SPELLS.ARCANE_SOUL_BUFF);
const ConeNetherPrecision = cnd.buffStacks(SPELLS.NETHER_PRECISION_BUFF, { atLeast: 1, atMost: 1 });
// const DtwoNetherPrecision = cnd.buffStacks(SPELLS.NETHER_PRECISION_BUFF, {atLeast: 2, atMost: 2});
const Eclearcasting = cnd.buffPresent(SPELLS.CLEARCASTING_BUFF);
const FfourArcaneCharges = cnd.hasResource(RESOURCE_TYPES.ARCANE_CHARGES, { atLeast: 4 });
const GanyBarrageEnhanceBuff = cnd.or(
  cnd.buffPresent(TALENTS.BURDEN_OF_POWER_TALENT),
  cnd.buffPresent(TALENTS.GLORIOUS_INCANDESCENCE_TALENT),
  cnd.buffPresent(SPELLS.INTUITION),
);
const HcastingAB = cnd.lastSpellCast(SPELLS.ARCANE_BLAST);
const InetherPrecision = cnd.buffPresent(SPELLS.NETHER_PRECISION_BUFF);

export const sunfuryApl = build([
  // TALENTS.ARCANE_MISSILES_TALENT,
  {
    spell: TALENTS.ARCANE_MISSILES_TALENT,
    condition: AthreeClearcasting,
  },
  {
    spell: SPELLS.ARCANE_BARRAGE,
    condition: BarcaneSoulActive,
  },
  {
    spell: SPELLS.ARCANE_BARRAGE,
    condition: cnd.and(FfourArcaneCharges, GanyBarrageEnhanceBuff, ConeNetherPrecision, HcastingAB),
  },
  {
    spell: SPELLS.ARCANE_BARRAGE,
    condition: cnd.and(
      FfourArcaneCharges,
      GanyBarrageEnhanceBuff,
      InetherPrecision,
      cnd.not(HcastingAB),
    ),
  },
  {
    spell: SPELLS.ARCANE_BARRAGE,
    condition: cnd.and(
      FfourArcaneCharges,
      GanyBarrageEnhanceBuff,
      cnd.not(InetherPrecision),
      cnd.not(Eclearcasting),
    ),
  },
  {
    spell: SPELLS.ARCANE_BLAST,
    condition: InetherPrecision,
  },
  {
    spell: TALENTS.ARCANE_MISSILES_TALENT,
    condition: Eclearcasting,
  },
  {
    spell: SPELLS.ARCANE_BLAST,
    condition: cnd.hasResource(RESOURCE_TYPES.MANA, { atLeast: 68750 }),
  },
  SPELLS.ARCANE_BARRAGE,
]);

export const sunfuryAplCheck = aplCheck(sunfuryApl);
