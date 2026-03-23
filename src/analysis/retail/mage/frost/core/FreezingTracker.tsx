import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  EventType,
  ApplyDebuffEvent,
  ApplyDebuffStackEvent,
  RemoveDebuffStackEvent,
  RemoveDebuffEvent,
  GetRelatedEvent,
  GetRelatedEvents,
  BuffEvent,
} from 'parser/core/Events';

export default class FreezingTracker extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FREEZING),
      this.onFreezingApply,
    );
  }

  freezingTracker: FreezingTrackerData[] = [];

  onFreezingApply(event: ApplyDebuffEvent) {
    const remove = GetRelatedEvent(event, EventType.RemoveDebuff);
    const stackGains: ApplyDebuffStackEvent[] = GetRelatedEvents(event, EventType.ApplyDebuffStack);
    const stackLoses: RemoveDebuffStackEvent[] = GetRelatedEvents(
      event,
      EventType.RemoveDebuffStack,
    );

    const stackTrackerData: StackTrackerData[] = stackGains.map((stackGainEvent) => {
      return {
        timestamp: stackGainEvent.timestamp,
        stacks: stackGainEvent.stack,
      };
    });

    stackTrackerData.concat(
      stackLoses.map((stackLoseEvent) => {
        return {
          timestamp: stackLoseEvent.timestamp,
          stacks: stackLoseEvent.stack,
        };
      }),
    );

    stackTrackerData.sort((a, b) => a.timestamp - b.timestamp);

    this.freezingTracker.push({
      applied: event.timestamp,
      removed: remove?.timestamp || 0,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
      stacks: stackTrackerData,
    });
  }

  getStacks(timestamp: number, targetID: number, targetInstance?: number) {
    this.freezingTracker.find((ft) => {
      if (ft.targetID === targetID && ft.targetInstance === targetInstance) {
        ft.stacks?.findLast((st) => {
          if (st.timestamp <= timestamp) {
            return st.stacks;
          }
        });
      }
    });
  }
}

export interface FreezingTrackerData {
  applied: number;
  removed: number;
  stacks?: StackTrackerData[];
  targetID: number;
  targetInstance?: number;
}

export interface StackTrackerData {
  timestamp: number;
  stacks: number;
}
