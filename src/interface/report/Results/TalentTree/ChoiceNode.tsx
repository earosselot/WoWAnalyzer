import { SingleNode } from 'interface/report/Results/TalentTree/SingleNode';

export function ChoiceNode(props: { node: any }) {
  const { node } = props;

  return (
    <>
      {node.active ? (
        <SingleNode node={node} spellId={node.activeEntrySpellId} />
      ) : (
        <div style={{ display: 'flex', gap: '4px' }}>
          <SingleNode node={node} spellId={node.entries[0].spellId} width={(node.iconPx - 2) / 2} />
          <SingleNode node={node} spellId={node.entries[1].spellId} width={(node.iconPx - 2) / 2} />
        </div>
      )}
    </>
  );
}
