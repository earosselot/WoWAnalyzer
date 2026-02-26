import SPELLS from 'common/SPELLS';

import EventLinkNormalizer, { EventLink } from 'parser/core/EventLinkNormalizer';
import { CastEvent, DamageEvent, EventType } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

const APPLY_DEBUFF = 'ApplyDebuff';
const DEBUFF_REFRESH = 'DebuffRefresh';
const DEBUFF_STACK_GAINED = 'DebuffStackGained';
const DEBUFF_STACK_LOST = 'DebuffStackLost';
const DAMAGE = 'Damage';
const DEBUFF_REMOVE = 'DebuffRemove';

const EVENT_LINKS: EventLink[] = [
  // {
  //     linkRelation: DEBUFF_STACK_GAINED,
  //     linkingEventId: SPELLS.FREEZING.id,
  //     linkingEventType: EventType.RefreshDebuff,
  //     referencedEventId: SPELLS.FREEZING.id,
  //     referencedEventType: EventType.ApplyDebuffStack,
  //     reverseLinkRelation: DEBUFF_REFRESH,
  //     maximumLinks: 1,
  //     forwardBufferMs: 100,
  //     backwardBufferMs: 100,
  // },
  // {
  //     linkRelation: DEBUFF_STACK_LOST,
  //     linkingEventId: SPELLS.FREEZING.id,
  //     linkingEventType: EventType.RefreshDebuff,
  //     referencedEventId: SPELLS.FREEZING.id,
  //     referencedEventType: EventType.RemoveDebuffStack,
  //     reverseLinkRelation: DEBUFF_REFRESH,
  //     maximumLinks: 1,
  //     forwardBufferMs: 100,
  //     backwardBufferMs: 100,
  // },
  // {
  //     linkRelation: DEBUFF_STACK_GAINED,
  //     linkingEventId: [SPELLS.GLACIAL_SPIKE_DAMAGE.id, SPELLS.FLURRY_DAMAGE.id, SPELLS.FROSTBOLT_DAMAGE.id, SPELLS.FROSTFIRE_BOLT_DAMAGE.id],
  //     linkingEventType: EventType.Damage,
  //     referencedEventId: SPELLS.FREEZING.id,
  //     referencedEventType: EventType.ApplyDebuffStack,
  //     reverseLinkRelation: APPLY_DEBUFF,
  //     maximumLinks: 1,
  //     forwardBufferMs: 0,
  //     backwardBufferMs: 200,
  // },
  {
    linkRelation: DAMAGE,
    linkingEventId: SPELLS.FREEZING.id,
    linkingEventType: EventType.ApplyDebuffStack,
    referencedEventId: [
      SPELLS.GLACIAL_SPIKE_DAMAGE.id,
      SPELLS.FLURRY_DAMAGE.id,
      SPELLS.FROSTBOLT_DAMAGE.id,
      SPELLS.FROSTFIRE_BOLT_DAMAGE.id,
      SPELLS.FROST_SPLINTER_DAMAGE.id,
      SPELLS.GLACIAL_ASSAULT_DAMAGE.id,
    ],
    referencedEventType: EventType.Damage,
    reverseLinkRelation: DEBUFF_STACK_GAINED,
    maximumLinks: 1,
    forwardBufferMs: 0,
    backwardBufferMs: 200,
  },
  {
    linkRelation: DAMAGE,
    linkingEventId: SPELLS.FREEZING.id,
    linkingEventType: EventType.RemoveDebuffStack,
    referencedEventId: [SPELLS.ICE_LANCE_DAMAGE.id, SPELLS.COMET_STORM_DAMAGE.id],
    referencedEventType: EventType.Damage,
    reverseLinkRelation: DEBUFF_STACK_LOST,
    maximumLinks: 1,
    forwardBufferMs: 600,
    backwardBufferMs: 600,
  },
  {
    linkRelation: DAMAGE,
    linkingEventId: SPELLS.FREEZING.id,
    linkingEventType: EventType.RemoveDebuff,
    referencedEventId: [SPELLS.ICE_LANCE_DAMAGE.id, SPELLS.COMET_STORM_DAMAGE.id],
    referencedEventType: EventType.Damage,
    reverseLinkRelation: DEBUFF_REMOVE,
    maximumLinks: 1,
    forwardBufferMs: 0,
    backwardBufferMs: 600,
  },
  {
    linkRelation: DAMAGE,
    linkingEventId: SPELLS.FREEZING.id,
    linkingEventType: [EventType.ApplyDebuff, EventType.RefreshDebuff],
    referencedEventId: [
      SPELLS.GLACIAL_SPIKE_DAMAGE.id,
      SPELLS.FLURRY_DAMAGE.id,
      SPELLS.FROSTBOLT_DAMAGE.id,
      SPELLS.FROSTFIRE_BOLT_DAMAGE.id,
      SPELLS.FROST_SPLINTER_DAMAGE.id,
      SPELLS.GLACIAL_ASSAULT_DAMAGE.id,
    ],
    referencedEventType: EventType.Damage,
    reverseLinkRelation: APPLY_DEBUFF,
    maximumLinks: 1,
    forwardBufferMs: 300,
    backwardBufferMs: 1000,
  },
];

class FreezingNormalizer extends EventLinkNormalizer {
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default FreezingNormalizer;
