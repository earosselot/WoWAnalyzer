import { TalentTreeSection } from 'interface/report/Results/TalentTree/TalentTreeSection';
import { TalentEntry } from 'parser/core/Events';
import { TalentTree } from 'interface/report/Results/TalentTree/TalentTreesSuplier';

/**
 * WoW Talent Grid (In talent units)
 * Talents positions come in a sort of grid. The grid dimensions are:
 * width = 15600 tu // height = 8400 tu
 * iconSize = 415 tu (aproximate measure taked in-game)
 * distance between rows/columns = 600 tu
 */

const wowTalentGridHeight = 7400;
const componentStyle = {
  display: 'flex',
  justifyContent: 'space-evenly',
  alignItems: 'center',
};

export function PlayerInfoTalentTreeContainer(props: {
  combatantTalentTree: TalentTree | null;
  talents: TalentEntry[];
}) {
  const width = 1300;
  const convertionFactor = ((width / 8) * 3) / 5400; // 600px / 5400tu

  const classNodes = props.combatantTalentTree?.classNodes;
  const specNodes = props.combatantTalentTree?.specNodes;
  const heroNodes = props.combatantTalentTree?.heroNodes;
  const subtreeNodes = props.combatantTalentTree?.subTreeNodes;

  const normalizedHeight = (): number => {
    return normalizeTalentUnits(wowTalentGridHeight);
  };

  const normalizeTalentUnits = (pos: number): number => {
    return pos * convertionFactor;
  };

  // Next line to filter hero nodes used by the player. Should replace '40' for the character subTreeId.
  let filteredHeroNodes = heroNodes?.filter((node: any) => node.subTreeId === 40);
  filteredHeroNodes = filteredHeroNodes ? filteredHeroNodes : [];

  const height = normalizedHeight();

  return (
    <div
      className="talent-container"
      style={{
        ...componentStyle,
        width: width,
        height: height,
      }}
    >
      <TalentTreeSection nodes={classNodes} talents={props.talents} width={width} />
      {filteredHeroNodes.length > 0 && (
        <TalentTreeSection
          nodes={filteredHeroNodes}
          talents={props.talents}
          subTreeNodes={subtreeNodes}
          width={width}
        />
      )}
      <TalentTreeSection nodes={specNodes} talents={props.talents} width={width} />
    </div>
  );
}
