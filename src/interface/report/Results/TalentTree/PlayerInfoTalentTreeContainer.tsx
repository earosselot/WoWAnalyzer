import { TalentTree } from 'interface/report/Results/TalentTree/TalentTree';

/**
 * WoW Talent Grid (In talent units)
 * Talents positions come in a sort of grid. The grid dimensions are:
 * width = 15600 tu // height = 8400 tu
 * iconSize = 415 tu (aproximate measure taked in-game)
 * distance between rows/columns = 600 tu
 */

const convertionFactor = 600 / 5400; // 600px / 5400tu
const wowTalentGridHeight = 7400;
const componentStyle = {
  display: 'flex',
  justifyContent: 'space-evenly',
  alignItems: 'center',
};

export function PlayerInfoTalentTreeContainer(props: {
  combatantTalentTree: any | undefined;
  talents: any;
}) {
  const width = 1300;

  const classNodes = props.combatantTalentTree.classNodes;
  const specNodes = props.combatantTalentTree.specNodes;
  const heroNodes = props.combatantTalentTree.heroNodes;
  const subtreeNodes = props.combatantTalentTree.subTreeNodes;

  const normalizedHeight = (): number => {
    return normalizeTalentUnits(wowTalentGridHeight);
  };

  const normalizeTalentUnits = (pos: number): number => {
    return pos * convertionFactor;
  };

  // next line to filter hero nodes. Should look for where we can get talentTreeId from.
  const filteredHeroNodes = heroNodes.filter((node: any) => node.subTreeId === 40);

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
      <TalentTree nodes={classNodes} talents={props.talents} width={width} />
      {!filteredHeroNodes.empty && (
        <TalentTree
          nodes={filteredHeroNodes}
          talents={props.talents}
          subTreeNodes={subtreeNodes}
          width={width}
        />
      )}
      <TalentTree nodes={specNodes} talents={props.talents} width={width} />
    </div>
  );
}
