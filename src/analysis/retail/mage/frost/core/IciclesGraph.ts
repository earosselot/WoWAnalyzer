import IciclesStackTracker from 'analysis/retail/mage/frost/core/IciclesStackTracker';
import BuffStackGraph from 'parser/shared/modules/BuffStackGraph';

class IciclesGraph extends BuffStackGraph {
  static dependencies = {
    ...BuffStackGraph.dependencies,
    iciclesStackTracker: IciclesStackTracker,
  };

  protected iciclesStackTracker!: IciclesStackTracker;

  tracker() {
    return this.iciclesStackTracker;
  }
}

export default IciclesGraph;
