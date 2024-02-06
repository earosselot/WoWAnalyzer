import { SHATTER_DEBUFFS } from 'analysis/retail/mage/shared';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';

class GlacialSpike extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  glacialSpike: {
    timestamp: number;
    shattered: boolean;
    damage: DamageEvent | undefined;
    cleave: DamageEvent | undefined;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.GLACIAL_SPIKE_TALENT),
      this.onGlacialSpikeCast,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ICICLES_BUFF),
      this.onIciclesApply,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.ICICLES_BUFF),
      this.onIciclesStack,
    );
  }

  onIciclesApply(event: ApplyBuffEvent) {
    console.log(event);
  }

  onIciclesStack(event: ApplyBuffStackEvent) {
    console.log(event);
  }

  onGlacialSpikeCast(event: CastEvent) {
    const damage: DamageEvent | undefined = GetRelatedEvent(event, 'SpellDamage');
    const enemy = damage && this.enemies.getEntity(damage);
    const cleave: DamageEvent | undefined = GetRelatedEvent(event, 'CleaveDamage');
    this.glacialSpike.push({
      timestamp: event.timestamp,
      shattered:
        (enemy && SHATTER_DEBUFFS.some((effect) => enemy.hasBuff(effect.id, event.timestamp))) ||
        false,
      damage: damage,
      cleave: cleave,
    });
  }

  get shatteredCasts() {
    return this.glacialSpike.filter((gs) => gs.shattered).length;
  }

  get totalCasts() {
    return this.glacialSpike.length;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            You cast Glacial Spike {this.totalCasts} times, {this.shatteredCasts} casts of which
            were Shattered
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.GLACIAL_SPIKE_TALENT}>
          {this.shatteredCasts} <small>Shattered Casts</small>
          <br />
          {this.totalCasts - this.shatteredCasts} <small>Non-Shattered Casts</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default GlacialSpike;
