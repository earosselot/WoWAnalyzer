import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import EventLinkNormalizer from 'parser/core/EventLinkNormalizer';
import {
  CastEvent,
  EventType,
  GetRelatedEvent,
  GetRelatedEvents,
  HasRelatedEvent,
} from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { createEventLinks, link } from 'analysis/retail/mage/shared/helpers/castLinkHelpers';

/**
 * Freezing Cast Link Normalizer
 *
 * DEFAULTS (can be overridden per-link):
 * - forwardBuffer: 75ms (CAST_BUFFER_MS)
 * - backwardBuffer: 75ms (CAST_BUFFER_MS)
 * - maxLinks: unlimited
 * - anyTarget: false (links only to same target)
 * - anySource: false (links only to same source)
 * - id: parent spell ID (defaults to the same spell ID as the cast being linked)
 * - reverseRelation: 'auto' (creates bidirectional link using parent EventType)
 *
 */
const EVENT_LINKS = createEventLinks({
  spell: SPELLS.FREEZING.id,
  parentType: EventType.ApplyDebuff,
  links: [
    link(EventType.RemoveDebuff, { forwardBuffer: 15000, maxLinks: 1 }),
    link(EventType.ApplyDebuffStack),
    {
      relation: EventType.ApplyDebuffStack,
      type: EventType.ApplyDebuffStack,
      id: SPELLS.FREEZING.id,
      anyTarget: false,
      forwardBuffer: 900000,
      condition: (linkingEvent, referencedEvent) => {
        const debuffEnd = GetRelatedEvent(linkingEvent, EventType.RemoveDebuff);
        return debuffEnd ? referencedEvent.timestamp < debuffEnd.timestamp : false;
      },
    },
    {
      relation: EventType.RemoveDebuffStack,
      type: EventType.RemoveDebuffStack,
      id: SPELLS.FREEZING.id,
      anyTarget: false,
      forwardBuffer: 900000,
      condition: (linkingEvent, referencedEvent) => {
        const debuffEnd = GetRelatedEvent(linkingEvent, EventType.RemoveDebuff);
        return debuffEnd ? referencedEvent.timestamp < debuffEnd.timestamp : false;
      },
    },
  ],
});

/**
 * Links the damage events for spells to their cast event. This allows for more
 * easily accessing the related events in spec modules instead of looking at the
 * events separately.
 */
class FreezingLinkNormalizer extends EventLinkNormalizer {
  combatant = this.owner.selectedCombatant;
  constructor(options: Options) {
    super(options, EVENT_LINKS);
  }
}

export default FreezingLinkNormalizer;
