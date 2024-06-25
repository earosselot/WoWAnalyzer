const stacksStyle: any = {
  position: 'absolute',
  bottom: '-4px',
  right: '-4px',
  backgroundColor: 'black',
  lineHeight: '1.2',
  padding: '0px 3px',
  fontSize: '10',
};

export function TalentTreeRank(props: { activeRank: number; maxRanks: number }) {
  const { activeRank, maxRanks } = props;

  return (
    <div className="talent-node-stacks" style={stacksStyle}>
      {activeRank}/{maxRanks}
    </div>
  );
}
