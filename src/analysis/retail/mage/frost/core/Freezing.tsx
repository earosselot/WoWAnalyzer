import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  ApplyDebuffStackEvent,
  FightEndEvent,
  RefreshDebuffEvent,
  RemoveDebuffStackEvent,
  EventType,
  GetRelatedEvent,
  DamageEvent,
  AnyEvent,
  RemoveDebuffEvent,
} from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import { SpellLink } from 'interface';

import { JSX } from 'react/jsx-runtime';
import GuideSection from 'interface/guide/components/GuideSection';
import CastOverview from 'interface/guide/components/CastOverview';
import { e } from 'node_modules/@lingui/react/dist/shared/react.34bf68ab.mjs';
import { time } from 'console';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { formatPercentage } from 'common/format';

const MAX_FREEZING_STACKS = 20;

class Freezing extends Analyzer.withDependencies({
  enemies: Enemies,
}) {
  freezing: {
    event:
      | ApplyDebuffEvent
      | RefreshDebuffEvent
      | ApplyDebuffStackEvent
      | RemoveDebuffStackEvent
      | RemoveDebuffEvent;
    type: string;
    timestamp: number;
    targetId: number;
    stacks: number;
  }[] = [];

  ICE_LANCE_FREEZING_CONSUMPTION =
    4 +
    (this.selectedCombatant.hasTalent(TALENTS.HEART_OF_ICE_TALENT) ? 1 : 0) +
    (this.selectedCombatant.hasTalent(TALENTS.POLISHED_FOCUS_TALENT) ? 1 : 0);
  wastedStacks = 0;
  suboptimalConsumptions: {
    stacksBefore: number;
    stacksMissing: number;
    consumer: string;
    timestamp: number;
  }[] = [];
  wastedPerHability = new Map<number, number>();
  private hasRefreshedAtMax = new Map<number, boolean>();

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FREEZING),
      this.onFreezingApply,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.FREEZING),
      this.onFreezingRemove,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.FREEZING),
      this.onFreezingReresh,
    );
    this.addEventListener(
      Events.removedebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FREEZING),
      this.onFreezingStackRemove,
    );
    this.addEventListener(
      Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FREEZING),
      this.onFreezingStackApply,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onFightEnd(event: FightEndEvent) {
    console.log('Total wasted Freezing stacks:', this.wastedStacks);
    console.log('Wasted Freezing stacks per ability:', this.wastedPerHability);
    const sum = Array.from(this.wastedPerHability.values()).reduce((accumulator, currentValue) => {
      return accumulator + currentValue;
    }, 0);
    console.log('Sum of wasted Freezing stacks:', sum);
    console.log('Total suboptimal Freezing consumptions:', this.suboptimalConsumptions);
    console.log('Total Ice Lance consumptions:', this.icelanceConsumptions);
    console.log('Suboptimal consumption details:', this.suboptimalConsumptions);
  }

  private currentFreezingStacks(event: AnyEvent) {
    const enemy = this.deps.enemies.getEntity(event);
    return enemy?.getBuffStacks(SPELLS.FREEZING.id, event.timestamp) ?? 0;
  }

  // This module tracks wasted stacks when at max stacks
  onFreezingReresh(event: RefreshDebuffEvent) {
    const currentStacks = this.currentFreezingStacks(event);
    const damageEvent: DamageEvent | undefined = GetRelatedEvent(event, 'Damage');

    if (currentStacks === MAX_FREEZING_STACKS) {
      if (this.hasRefreshedAtMax.get(event.targetID)) {
        this.wastedStacks++;
        const damageAbilityGuid = damageEvent?.ability?.guid || 0;
        this.wastedPerHability.set(
          damageAbilityGuid,
          (this.wastedPerHability.get(damageAbilityGuid) || 0) + 1,
        );
      }
      this.hasRefreshedAtMax.set(event.targetID, true);
    }

    this.freezing.push({
      event: event,
      type: event.type,
      timestamp: event.timestamp,
      targetId: event.targetID,
      stacks: currentStacks,
    });
  }

  // This module tracks wasted stacks when at max stacks
  onFreezingApply(event: ApplyDebuffEvent) {
    const currentStacks = this.currentFreezingStacks(event);

    this.freezing.push({
      event: event,
      type: event.type,
      timestamp: event.timestamp,
      targetId: event.targetID,
      stacks: currentStacks,
    });
  }

  onFreezingRemove(event: RemoveDebuffEvent) {
    const enemy = this.deps.enemies.getEntity(event);
    const damageEvent: DamageEvent | undefined = GetRelatedEvent(event, 'Damage');
    const stacksBefore = damageEvent && this.currentFreezingStacks(damageEvent);

    // This is a minimum suboptimal stacks.
    // This is not tracking suboptimal consumptions when Thermal Void is up and talented.
    if (
      damageEvent?.ability?.guid === SPELLS.ICE_LANCE_DAMAGE.id &&
      stacksBefore !== undefined &&
      stacksBefore < this.ICE_LANCE_FREEZING_CONSUMPTION
    ) {
      this.suboptimalConsumptions.push({
        stacksBefore: stacksBefore,
        stacksMissing: this.ICE_LANCE_FREEZING_CONSUMPTION - stacksBefore,
        consumer: damageEvent.ability.name,
        timestamp: event.timestamp,
      });
    }

    this.freezing.push({
      event: event,
      type: event.type,
      timestamp: event.timestamp,
      targetId: event.targetID,
      stacks: 0,
    });
  }

  // This module tracks wasted stacks when not at max stacks
  onFreezingStackApply(event: ApplyDebuffStackEvent) {
    const enemy = this.deps.enemies.getEntity(event);
    const stacksBefore = this.currentFreezingStacks(event);
    const damageEvent: DamageEvent | undefined = GetRelatedEvent(event, 'Damage');

    const stacksGainedByAbility =
      damageEvent?.ability?.guid === SPELLS.GLACIAL_SPIKE_DAMAGE.id ? 3 : 1;
    const potentialStacks = stacksBefore + stacksGainedByAbility;

    if (potentialStacks > MAX_FREEZING_STACKS) {
      this.wastedStacks += potentialStacks - MAX_FREEZING_STACKS;
      const damageAbilityGuid = damageEvent?.ability?.guid || 0;
      this.wastedPerHability.set(
        damageAbilityGuid,
        (this.wastedPerHability.get(damageAbilityGuid) || 0) + 1,
      );
    }

    if (event.stack < MAX_FREEZING_STACKS) {
      this.hasRefreshedAtMax.set(event.targetID, false);
    }

    this.freezing.push({
      event: event,
      type: event.type,
      timestamp: event.timestamp,
      targetId: event.targetID,
      stacks: event.stack,
    });
  }

  icelanceConsumptions = 0;
  onFreezingStackRemove(event: RemoveDebuffStackEvent | ApplyDebuffStackEvent) {
    const enemy = this.deps.enemies.getEntity(event);
    const damageEvent: DamageEvent | undefined = GetRelatedEvent(event, 'Damage');

    if (damageEvent?.ability?.guid === SPELLS.ICE_LANCE_DAMAGE.id) {
      this.icelanceConsumptions++;
    }

    if (event.stack < MAX_FREEZING_STACKS) {
      this.hasRefreshedAtMax.set(event.targetID, false);
    }

    this.freezing.push({
      event: event,
      type: event.type,
      timestamp: event.timestamp,
      targetId: event.targetID,
      stacks: event.stack,
    });
  }

  private buildFreezingApplyStats() {
    const stats = [];

    const glacialAssaultWasted = this.wastedPerHability.get(SPELLS.GLACIAL_ASSAULT_DAMAGE.id) || 0;
    const frostboltWasted = this.wastedPerHability.get(SPELLS.FROSTBOLT_DAMAGE.id) || 0;
    const frostfireBoltWasted = this.wastedPerHability.get(SPELLS.FROSTFIRE_BOLT_DAMAGE.id) || 0;
    const flurryWasted = this.wastedPerHability.get(SPELLS.FLURRY_DAMAGE.id) || 0;
    const glacialSpikeWasted = this.wastedPerHability.get(SPELLS.GLACIAL_SPIKE_DAMAGE.id) || 0;
    const rayOfFrostWasted = this.wastedPerHability.get(TALENTS.RAY_OF_FROST_TALENT.id) || 0;
    const frostSplinterWasted = this.wastedPerHability.get(SPELLS.FROST_SPLINTER_DAMAGE.id) || 0;

    let wastedPerformance = QualitativePerformance.Fail;
    if (this.wastedStacks === 0) {
      wastedPerformance = QualitativePerformance.Perfect;
    } else if (this.wastedStacks - frostSplinterWasted - glacialAssaultWasted <= 2) {
      wastedPerformance = QualitativePerformance.Good;
    }

    stats.push({
      value: `${this.wastedStacks}`,
      label: 'Wasted Freezing Stacks',
      tooltip:
        'Number of times Freezing was refreshed at max stacks or gained more stacks than the max, leading to wasted damage potential from Ice Lance.',
      performance: wastedPerformance,
    });

    if (frostboltWasted > 0) {
      stats.push({
        value: `${frostboltWasted}`,
        label: 'Wasted Stacks by Frostbolt',
        tooltip:
          'Number of wasted Freezing stacks that were caused by Frostbolt applying or refreshing Freezing at max stacks.',
        performance: QualitativePerformance.Fail,
      });
    }

    if (frostfireBoltWasted > 0) {
      stats.push({
        value: `${frostfireBoltWasted}`,
        label: 'Wasted Stacks by Frostfire Bolt',
        tooltip:
          'Number of wasted Freezing stacks that were caused by Frostfire Bolt applying or refreshing Freezing at max stacks.',
        performance: QualitativePerformance.Fail,
      });
    }

    if (flurryWasted > 0) {
      stats.push({
        value: `${flurryWasted}`,
        label: 'Wasted Stacks by Flurry',
        tooltip:
          'Number of wasted Freezing stacks that were caused by Flurry applying or refreshing Freezing at max stacks.',
        performance: QualitativePerformance.Fail,
      });
    }

    if (glacialSpikeWasted > 0) {
      stats.push({
        value: `${glacialSpikeWasted}`,
        label: 'Wasted Stacks by Glacial Spike',
        tooltip:
          'Number of wasted Freezing stacks that were caused by Glacial Spike applying or refreshing Freezing at max stacks.',
        performance: QualitativePerformance.Fail,
      });
    }

    if (rayOfFrostWasted > 0) {
      stats.push({
        value: `${rayOfFrostWasted}`,
        label: 'Wasted Stacks by Ray of Frost',
        tooltip:
          'Number of wasted Freezing stacks that were caused by Ray of Frost applying or refreshing Freezing at max stacks.',
        performance: QualitativePerformance.Fail,
      });
    }

    if (frostSplinterWasted > 0) {
      stats.push({
        value: `${frostSplinterWasted}`,
        label: 'Wasted Stacks by Frost Splinter',
        tooltip:
          'Number of wasted Freezing stacks that were caused by Frost Splinter applying or refreshing Freezing at max stacks.',
        performance: QualitativePerformance.Ok,
      });
    }

    if (glacialAssaultWasted > 0) {
      stats.push({
        value: `${glacialAssaultWasted}`,
        label: 'Wasted Stacks by Glacial Assault',
        tooltip:
          'Number of wasted Freezing stacks that were caused by Glacial Assault applying or refreshing Freezing at max stacks.',
        performance: QualitativePerformance.Ok,
      });
    }

    return stats;
  }

  private buildFreezingRemoveStats() {
    const stats = [];

    stats.push({
      value: `${this.icelanceConsumptions}`,
      label: 'Good Ice Lances',
      tooltip: 'Number of times Freezing stacks were consumed by Ice Lance.',
      performance:
        this.icelanceConsumptions > 0 ? QualitativePerformance.Good : QualitativePerformance.Fail,
    });

    stats.push({
      value: `${this.suboptimalConsumptions.length}`,
      label: 'Bad Ice Lances',
      tooltip:
        'Number of times Ice Lance consumed less than the optimal amount of Freezing stacks.',
      performance:
        this.suboptimalConsumptions.length == 0
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Fail,
    });

    const badIceLanceCastPercentage: number =
      this.suboptimalConsumptions.length > 0
        ? this.suboptimalConsumptions.length /
          (this.icelanceConsumptions + this.suboptimalConsumptions.length)
        : 0.0;
    stats.push({
      value: `${formatPercentage(badIceLanceCastPercentage)}%`,
      label: '% of Bad Ice Lance Casts',
      tooltip:
        'Percentage of Ice Lance casts that consumed less than the optimal amount of Freezing stacks.',
      performance:
        badIceLanceCastPercentage == 0
          ? QualitativePerformance.Perfect
          : badIceLanceCastPercentage > 5
            ? QualitativePerformance.Ok
            : QualitativePerformance.Fail,
    });

    const freezingStacksLostBySuboptimalConsumptions = this.suboptimalConsumptions.reduce(
      (sum, consumption) => sum + consumption.stacksMissing,
      0,
    );
    stats.push({
      value: `${freezingStacksLostBySuboptimalConsumptions}`,
      label: 'Freezing Stacks Lost by Bad Ice Lances',
      tooltip:
        'Total number of Freezing stacks that were not consumed due to suboptimal Ice Lance casts.',
      performance:
        freezingStacksLostBySuboptimalConsumptions == 0
          ? QualitativePerformance.Perfect
          : QualitativePerformance.Fail,
    });

    return stats;
  }

  get guideSubsection(): JSX.Element {
    const freezing = <SpellLink spell={SPELLS.FREEZING} />;
    const iceLance = <SpellLink spell={TALENTS.ICE_LANCE_TALENT} />;
    const frostbolt = <SpellLink spell={SPELLS.FROSTBOLT} />;
    const frostfireBolt = <SpellLink spell={TALENTS.FROSTFIRE_BOLT_1_FIRE_TALENT} />;
    const glacialSpike = <SpellLink spell={SPELLS.GLACIAL_SPIKE} />;
    const flurry = <SpellLink spell={TALENTS.FLURRY_TALENT} />;
    const rayOfFrost = <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} />;
    const cometStorm = <SpellLink spell={TALENTS.COMET_STORM_TALENT} />;
    const frostSplinter = <SpellLink spell={SPELLS.FROST_SPLINTER_DAMAGE} />;
    const glacialAssault = <SpellLink spell={SPELLS.GLACIAL_ASSAULT_DAMAGE} />;

    const explanation = (
      <>
        <p>
          {freezing} is the core mechanic of Frost Mage and is played in a builder / spender
          fashion.
        </p>
        <b>Stacking {freezing}</b>
        <p>
          You want to keep stacks lower than {MAX_FREEZING_STACKS} to maximize the damage of your{' '}
          {iceLance}, so you should try to avoid refreshing it at max stacks or applying more stacks
          than the max.
        </p>
        <p>
          {freezing} generator spells:
          {this.selectedCombatant.hasTalent(TALENTS.FROSTFIRE_BOLT_1_FIRE_TALENT) ? (
            <> {frostfireBolt} x1 -</>
          ) : (
            <> {frostbolt} x1 -</>
          )}
          <>{glacialSpike} x3 - </>
          {flurry} x4 (1/hit) -{rayOfFrost} x8 (1/hit) -{glacialAssault} x1 (passive) -
          {this.selectedCombatant.hasTalent(TALENTS.INFUSED_SPLINTERS_TALENT) && (
            <>{frostSplinter} x1 (passive)</>
          )}
        </p>
        <b>Consuming {freezing}</b>
        <p>
          We only have 2 main consumers of {freezing}, {iceLance} and {cometStorm}.{iceLance} will
          consume {this.ICE_LANCE_FREEZING_CONSUMPTION} stacks of {freezing}. Meaning you should
          only cast
          {iceLance} when you have at least {this.ICE_LANCE_FREEZING_CONSUMPTION} stacks of{' '}
          {freezing}.
        </p>
      </>
    );

    return (
      <GuideSection spell={SPELLS.FREEZING} explanation={explanation} explanationPercent={50}>
        <CastOverview spell={SPELLS.FREEZING} stats={this.buildFreezingApplyStats()} />
        <CastOverview spell={TALENTS.ICE_LANCE_TALENT} stats={this.buildFreezingRemoveStats()} />
        {/* <CastSummary
          spell={TALENTS.ARCANE_MISSILES_TALENT}
          casts={this.arcaneMissiles.missileData.map((cast) => this.evaluateMissilesCast(cast))}
          showBreakdown
        /> */}
      </GuideSection>
    );
  }
}

export default Freezing;
