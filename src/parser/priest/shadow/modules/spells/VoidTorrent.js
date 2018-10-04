import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import Voidform from './Voidform';

function formatSeconds(seconds) {
  return Math.round(seconds * 10) / 10;
}

// account for some logger delay (should be 4000):
const TIMESTAMP_ERROR_MARGIN = 100;
const VOID_TORRENT_MAX_TIME = 4000;

class VoidTorrent extends Analyzer {
  static dependencies = {
    voidform: Voidform,
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VOID_TORRENT_TALENT.id);
  }

  _voidTorrents = {};
  _previousVoidTorrentCast = null;

  startedVoidTorrent(event) {
    this._voidTorrents[event.timestamp] = {
      start: event.timestamp,
    };

    this._previousVoidTorrentCast = event;
  }

  finishedVoidTorrent({ event, wastedTime }) {
    this._voidTorrents[this._previousVoidTorrentCast.timestamp] = {
      ...this._voidTorrents[this._previousVoidTorrentCast.timestamp],
      wastedTime,
      end: event.timestamp,
    };

    // due to sometimes being able to cast it at the same time as you leave voidform:
    if(this.voidform.inVoidform){
      this.voidform.addVoidformEvent(SPELLS.VOID_TORRENT_TALENT.id, {
        start: this.voidform.normalizeTimestamp({timestamp: this._previousVoidTorrentCast.timestamp}),
        end: this.voidform.normalizeTimestamp(event),
      });
    }

    this._previousVoidTorrentCast = null;
  }

  get voidTorrents() {
    return Object.keys(this._voidTorrents).map(key => this._voidTorrents[key]);
  }

  get totalWasted() {
    return this.voidTorrents.reduce((total, c) => total + c.wastedTime, 0) / 1000;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOID_TORRENT_TALENT.id) {
      this.startedVoidTorrent(event);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.VOID_TORRENT_TALENT.id) {
      const timeSpentChanneling = event.timestamp - this._previousVoidTorrentCast.timestamp;
      const wastedTime = (VOID_TORRENT_MAX_TIME - TIMESTAMP_ERROR_MARGIN) > timeSpentChanneling ? (VOID_TORRENT_MAX_TIME - timeSpentChanneling) : 0;
      this.finishedVoidTorrent({ event, wastedTime });
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.totalWasted,
      isGreaterThan: {
        minor: 0.2,
        average: 0.5,
        major: 2,
      },
      style: 'seconds',
    };
  }

  suggestions(when) {
    when(this.totalWasted).isGreaterThan(this.suggestionThresholds.average)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You interrupted <SpellLink id={SPELLS.VOID_TORRENT_TALENT.id} /> early, wasting {formatSeconds(this.totalWasted)} channeling seconds! Try to position yourself & time it so you don't get interrupted due to mechanics.</>)
          .icon(SPELLS.VOID_TORRENT_TALENT.icon)
          .actual(`Lost ${formatSeconds(actual)} seconds of Void Torrent.`)
          .recommended('No time wasted is recommended.')
          .regular(this.suggestionThresholds.average).major(this.suggestionThresholds.major);
      });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(7)}
        icon={<SpellIcon id={SPELLS.VOID_TORRENT_TALENT.id} />}
        value={`${formatSeconds(this.totalWasted)} seconds`}
        label={(
          <dfn data-tip="Lost Void Torrent channeling time.">
            Interrupted Void Torrents
          </dfn>
        )}
      />
    );
  }
}

export default VoidTorrent;
