const svgStyle = {
  stroke: 'currentcolor',
  fill: 'none',
  strokeWidth: '0',
  height: '16.5',
  width: '16.5',
  color: 'rgb(255, 209, 0)',
  top: '50%',
  transform: 'translate(0%, -50%)',
};

export function ChoiceArrows(props: { nodeType: string; active: boolean }) {
  const { nodeType, active } = props;

  const rightChoiceArrow = (
    <svg
      viewBox="0 0 15 15"
      style={{
        ...svgStyle,
        position: 'absolute',
        right: '-13.5px',
        filter: active ? 'grayscale(0)' : 'grayscale(1)',
      }}
    >
      <path d="M6 11L6 4L10.5 7.5L6 11Z" fill="currentColor"></path>
    </svg>
  );

  const leftChoiceArrow = (
    <>
      <svg
        viewBox="0 0 15 15"
        style={{
          ...svgStyle,
          position: 'absolute',
          left: '-13.5px',
          filter: active ? 'grayscale(0)' : 'grayscale(1)',
        }}
      >
        <path d="M9 4L9 11L4.5 7.5L9 4Z" fill="currentColor"></path>
      </svg>
    </>
  );

  return (
    <>
      {nodeType === 'choice' && rightChoiceArrow}
      {nodeType === 'choice' && leftChoiceArrow}
    </>
  );
}
