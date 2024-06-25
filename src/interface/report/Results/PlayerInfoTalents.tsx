import { Trans } from '@lingui/macro';
import { TalentEntry } from 'parser/core/Events';
// import PlayerInfoTalent from 'interface/report/Results/PlayerInfoTalent';
import talentTrees from '../../../../public/specs-tww.json';
import { PlayerInfoTalentTreeContainer } from 'interface/report/Results/TalentTree/PlayerInfoTalentTreeContainer';

interface Props {
  talents: TalentEntry[];
  specId: number;
}

const PlayerInfoTalents = ({ talents, specId }: Props) => {
  if (talents.every((talent) => talent.spellID === 0)) {
    return (
      <div className="player-details-talents">
        <h3>
          <Trans id="common.talents">Talents</Trans>
        </h3>
        <div className="talent-info">
          <Trans id="interface.report.talents.parseFailed">
            An error occurred while parsing talents. Talent information for the build this log is
            from may not be available.
          </Trans>
        </div>
      </div>
    );
  }

  const combatantTalentTree = talentTrees.find((talentTree) => talentTree.specId === specId);

  return (
    <div className="player-details-talents">
      <h3>
        <Trans id="common.talents">Talents</Trans>
      </h3>
      <PlayerInfoTalentTreeContainer talents={talents} combatantTalentTree={combatantTalentTree} />
      {/*<div className="talent-info">*/}
      {/*  {talents.map((talent) => (*/}
      {/*    <PlayerInfoTalent key={talent.id} talentEntry={talent} />*/}
      {/*  ))}*/}
      {/*</div>*/}
    </div>
  );
};

export default PlayerInfoTalents;
