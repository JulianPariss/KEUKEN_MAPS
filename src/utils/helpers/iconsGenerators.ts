export const createCircleSVG = (color: string) => {
    const svg = `
    <svg width="8" height="8" xmlns="http://www.w3.org/2000/svg">
      <circle cx="4" cy="4" r="3" fill="${color}" stroke="#333" stroke-width="1" />
    </svg>
  `;

    return "data:image/svg+xml;base64," + btoa(svg);
};