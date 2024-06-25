import { TalentTreeRank } from 'interface/report/Results/TalentTree/TalentTreeRank';
import { TalentTreeNodePositioner } from 'interface/report/Results/TalentTree/TalentTreeNodePositioner';
import { SingleNode } from 'interface/report/Results/TalentTree/SingleNode';
import { ChoiceNode } from 'interface/report/Results/TalentTree/ChoiceNode';
import { ChoiceArrows } from 'interface/report/Results/TalentTree/ChoiceArrows';

export function TalentTreeNode(props: { node: any }) {
  const { node } = props;

  const getBorderRadius = (entry: any) => {
    return entry.type === 'active' ? '0' : node.iconPx / 2;
  };

  return (
    <TalentTreeNodePositioner key={node.id} node={node}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
          border: '2px solid rgba(255, 209, 0, 1)',
          backgroundColor: 'rgba(255, 209, 0, 1)',
          overflow: 'hidden',
          width: node.iconPx,
          height: node.iconPx,
          borderRadius: getBorderRadius(node.entries[0]),
          filter: node.active ? 'grayscale(0)' : 'grayscale(1)',
        }}
      >
        {node.type === 'choice' ? (
          <ChoiceNode node={node} key={node.id} />
        ) : (
          <SingleNode node={node} key={node.id} />
        )}
      </div>
      <TalentTreeRank activeRank={node.activeRank} maxRanks={node.maxRanks} />
      <ChoiceArrows nodeType={node.type} active={node.active} />
    </TalentTreeNodePositioner>
  );
}
