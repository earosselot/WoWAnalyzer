import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { Options } from 'parser/core/Analyzer';
import EventOrderNormalizer, { EventOrder } from 'parser/core/EventOrderNormalizer';
import { EventType } from 'parser/core/Events';

const EVENT_ORDERS: EventOrder[] = [
  {
    afterEventId: TALENTS.ICE_LANCE_TALENT.id,
    afterEventType: EventType.Cast,
    beforeEventId: SPELLS.ICICLES_BUFF.id,
    beforeEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    bufferMs: 25,
    anyTarget: true,
    updateTimestamp: true,
  },
  {
    afterEventId: SPELLS.FROSTBOLT.id,
    afterEventType: EventType.BeginCast,
    beforeEventId: SPELLS.ICICLES_BUFF.id,
    beforeEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    bufferMs: 25,
    anyTarget: true,
    updateTimestamp: true,
  },
  {
    afterEventId: SPELLS.FROSTBOLT.id,
    afterEventType: EventType.Cast,
    beforeEventId: SPELLS.ICICLES_BUFF.id,
    beforeEventType: [EventType.RemoveBuff, EventType.RemoveBuffStack],
    bufferMs: 25,
    anyTarget: true,
    updateTimestamp: true,
  },
];

export default class FrostEventOrderNormalizer extends EventOrderNormalizer {
  constructor(options: Options) {
    super(options, EVENT_ORDERS);
  }
}
