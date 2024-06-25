import { SpellIcon } from 'interface';
import { TalentTreeRank } from 'interface/report/Results/TalentTree/TalentTreeRank';
import { TalentTreeNodePositioner } from 'interface/report/Results/TalentTree/TalentTreeNodePositioner';

export function TalentTreeNode(props: { node: any }) {
  const { node } = props;

  const getBorderRadius = (entry: any) => {
    return entry.type === 'active' ? '0' : node.iconPx / 2;
  };

  // const activeEntry = node.entries.find((entry: any) => entry.id === node.activeEntryId);

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
        }}
      >
        <div style={{ boxSizing: 'border-box', width: node.iconPx - 2, height: node.iconPx - 2 }}>
          <div
            style={{
              position: 'relative',
              boxSizing: 'border-box',
              width: node.iconPx - 2,
              height: node.iconPx - 2,
              lineHeight: '3',
            }}
          >
            <SpellIcon
              spell={node.entries[0].spellId}
              style={{
                width: node.iconPx - 2,
                height: node.iconPx - 2,
                top: '5',
              }}
            />
          </div>
        </div>
      </div>

      <TalentTreeRank activeRank={node.activeRank} maxRanks={node.maxRanks} />
    </TalentTreeNodePositioner>
  );
}
