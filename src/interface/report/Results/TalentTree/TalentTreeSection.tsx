import { TalentTreeNode } from 'interface/report/Results/TalentTree/TalentTreeNode';
import { TalentNode } from 'scripts/talents/talent-tree-types';

/**
 * WoW Talent Grid (In talent units)
 * Talents positions come in a sort of grid. The grid dimensions are:
 * width = 15600 tu // height = 8400 tu
 * iconSize = 415 tu (aproximate measure taked in-game)
 * distance between rows/columns = 600 tu
 */

interface Props {
  nodes: TalentNode[];
  talents: any;
  subTreeNodes?: any;
  width: number;
}

// const convertionFactor = 600 / 5400; // 600px / 5400tu
// const talentGridHeight = 7400;
const wowTalentIconSize = 415;

export function TalentTreeSection({ nodes, talents, subTreeNodes, width }: Props) {
  const convertionFactor = ((width / 8) * 3) / 5400; // 600px / 5400tu

  const nodesPosXmin = nodes.reduce(
    (acc: any, curr: any) => (curr.posX < acc.posX ? curr : acc),
    nodes[0] || undefined,
  )?.posX;
  const nodesPosXmax = nodes.reduce(
    (acc: any, curr: any) => (curr.posX > acc.posX ? curr : acc),
    nodes[0] || undefined,
  )?.posX;
  const posXCorrection = nodesPosXmin - 600;
  const specTalentGridWidth = nodesPosXmax - nodesPosXmin + 1200;

  const nodesPosYmin = nodes.reduce(
    (acc: any, curr: any) => (curr.posY < acc.posY ? curr : acc),
    nodes[0] || undefined,
  )?.posY;
  const nodesPosYmax = nodes.reduce(
    (acc: any, curr: any) => (curr.posY > acc.posY ? curr : acc),
    nodes[0] || undefined,
  )?.posY;
  const posYCorrection = subTreeNodes ? nodesPosYmin - 600 : nodesPosYmin - 600; // todo: review this
  const specTalentGridHeight = subTreeNodes
    ? nodesPosYmax - nodesPosYmin + 1200
    : nodesPosYmax - nodesPosYmin + 1200; // todo: review this

  const hasTalent = (entry: any) => {
    return talents.some((talent: { id: any }) => talent.id === entry.id);
  };

  const talentUnitsToPixel = (tu: number): number => {
    return tu * convertionFactor;
  };

  const iconSizePx = talentUnitsToPixel(wowTalentIconSize);

  nodes.forEach((node: any) => {
    node.topPx = talentUnitsToPixel(node.posY - posYCorrection) - iconSizePx / 2;
    node.rightPx = talentUnitsToPixel(node.posX - posXCorrection) - iconSizePx / 2;
    node.iconPx = iconSizePx;
    node.active = node.entries?.some((entry: any) => hasTalent(entry));
    node.activeEntry = node.entries?.find((entry: any) => hasTalent(entry));
    node.activeEntrySpellId = node.activeEntry?.spellId;
    node.activeEntryId = node.activeEntry?.id;
    node.activeRank = talents.find((talent: any) => talent.id === node.activeEntryId)?.rank || 0;
  });

  const nodePaths = nodes.flatMap((node: any) => {
    return node.next.map((nextNodeId: any) => {
      const nextNode = nodes.find((nextNode: any) => nextNode.id === nextNodeId);
      return {
        id: node.id + nextNode.id,
        originNode: node.id,
        destinationNode: nextNode.id,
        originX: talentUnitsToPixel(node.posX - posXCorrection),
        originY: talentUnitsToPixel(node.posY - posYCorrection),
        destinationX: talentUnitsToPixel(nextNode.posX - posXCorrection),
        destinationY: talentUnitsToPixel(nextNode.posY - posYCorrection),
        active:
          node.entries?.some((entry: any) => hasTalent(entry)) &&
          nextNode.entries.some((entry: any) => hasTalent(entry)),
      };
    });
  });

  const containerStyle: any = {
    width: talentUnitsToPixel(specTalentGridWidth),
    height: talentUnitsToPixel(specTalentGridHeight),
    position: 'relative',
  };

  const svgContainerStyle: any = {
    width: talentUnitsToPixel(specTalentGridWidth),
    height: talentUnitsToPixel(specTalentGridHeight),
  };

  return (
    <div style={containerStyle}>
      {subTreeNodes && subTreeNodes.entries[0]}
      {nodes.map((node: any) => (
        <TalentTreeNode key={node.id} node={node} />
      ))}
      <svg style={svgContainerStyle}>
        {nodePaths.map((path: any) => (
          <line
            key={path.id}
            x1={path.originX}
            y1={path.originY}
            x2={path.destinationX}
            y2={path.destinationY}
            style={{
              stroke: 'rgba(255, 209, 0, 1)',
              strokeWidth: 2,
              filter: path.active ? 'grayscale(0)' : 'grayscale(1) opacity(50%)',
            }}
          />
        ))}
      </svg>
    </div>
  );
}
