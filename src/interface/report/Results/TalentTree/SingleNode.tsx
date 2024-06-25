import { SpellIcon } from 'interface';

export function SingleNode(props: { node: any; width?: number; spellId?: number }) {
  const { node, width, spellId } = props;

  return (
    <div style={{ boxSizing: 'border-box', width: node.iconPx - 2, height: node.iconPx - 2 }}>
      <div
        style={{
          position: 'relative',
          boxSizing: 'border-box',
          width: width || node.iconPx - 2,
          height: node.iconPx - 2,
          lineHeight: '3',
        }}
      >
        <SpellIcon
          spell={spellId || node.entries[0].spellId}
          style={{ width: node.iconPx, height: node.iconPx }}
        />
      </div>
    </div>
  );
}
