import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import BuffStackTracker from 'parser/shared/modules/BuffStackTracker';

class IciclesStackTracker extends BuffStackTracker {
  static trackedBuff = SPELLS.ICICLES_BUFF;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(options: Options) {
    super(options);
  }
}

export default IciclesStackTracker;
