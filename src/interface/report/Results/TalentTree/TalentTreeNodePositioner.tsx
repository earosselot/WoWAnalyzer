import { PropsWithChildren } from 'react';

type propsType = {
  key: string;
  node: any;
};

export function TalentTreeNodePositioner(props: PropsWithChildren<propsType>) {
  const { node, children } = props;

  const positionerStyle: any = {
    position: 'absolute',
    top: node.topPx,
    left: node.rightPx,
    width: node.iconPx,
    height: node.iconPx,
  };

  const containterStyle: any = {
    position: 'relative',
    width: node.iconPx,
    height: node.iconPx,
  };

  return (
    <div style={positionerStyle}>
      <div style={containterStyle}>{children}</div>
    </div>
  );
}
