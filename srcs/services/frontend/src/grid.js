const gridSquares = Array(100).fill(0);

const walls = [
  {
    origin: "left",
    transform: "rotateY(90deg)",
    width: "1000px",
    bottom: "0px",
    left: "0px",
  },
  {
    origin: "top",
    transform: "rotateX(-90deg)",
    height: "1000px",
    top: "0px",
    left: "0px"
  },
  {
    origin: "right",
    transform: "rotateY(-90deg)",
    width: "1000px",
    top: "0px",
    right: "0px"
  },
  {
    origin: "bottom",
    transform: "rotateX(90deg)",
    height: "1000px",
    left: "0px",
    bottom: "0px"
  }
];

function createWallDiv(wall) {
  const wallDiv = document.createElement("div");
  wallDiv.style.position = "absolute";
  wallDiv.style.background = "#7000ff";
  wallDiv.style.display = "grid";
  wallDiv.style.gap = "0.25rem";
  wallDiv.style.gridTemplateRows = "repeat(10, minmax(0, 1fr))";
  wallDiv.style.gridTemplateColumns = "repeat(10, minmax(0, 1fr))";
  wallDiv.style.transform = wall.transform;
  wallDiv.style.transformOrigin = wall.origin;
  wallDiv.style.width = wall.width || "100%";
  wallDiv.style.height = wall.height || "100%";
  wallDiv.style.left = wall.left || null;
  wallDiv.style.top = wall.top || null;
  wallDiv.style.right = wall.right || null;
  wallDiv.style.bottom = wall.bottom || null;

  gridSquares.forEach((_, j) => {
    const cellDiv = document.createElement("div");
    cellDiv.style.background = "black";
    wallDiv.appendChild(cellDiv);
  });

  return wallDiv;
}

function createTunnel() {
  const tunnelDiv = document.createElement("div");
  tunnelDiv.style.display = "flex";
  tunnelDiv.style.flexDirection = "column";
  tunnelDiv.style.justifyContent = "center";
  tunnelDiv.style.maxWidth = "100vw";
  tunnelDiv.style.backgroundColor = "black";
  tunnelDiv.style.height = "100vh";

  const scrollTunnelDiv = document.createElement("div");
  scrollTunnelDiv.style.perspective = "600px";
  scrollTunnelDiv.style.position = "sticky";
  scrollTunnelDiv.style.top = "0px";
  scrollTunnelDiv.style.width = "100%";
  scrollTunnelDiv.style.height = "100vh";

  const innerTunnelDiv = document.createElement("div");
  innerTunnelDiv.style.transformStyle = "preserve-3d";
  innerTunnelDiv.style.position = "absolute";
  innerTunnelDiv.style.top = "0px";
  innerTunnelDiv.style.left = "0px";
  innerTunnelDiv.style.width = "100vw";
  innerTunnelDiv.style.height = "100vh";


  const mainDiv = document.createElement("div");
  mainDiv.setAttribute('id', 'app')
  // mainDiv.style.transformStyle = "preserve-3d";
  // mainDiv.style.position = "absolute";
  // mainDiv.style.top = "calc(50%)";
  // mainDiv.style.left = "calc(50%)";
  // mainDiv.style.transform = "translate(-50%, -50%)";
  // mainDiv.style.width = "50vw";
  // mainDiv.style.height = "50vh";

  walls.forEach((wall, i) => {
    const wallDiv = createWallDiv(wall);
    innerTunnelDiv.appendChild(wallDiv);
  });

  scrollTunnelDiv.appendChild(innerTunnelDiv);
  tunnelDiv.appendChild(scrollTunnelDiv);
  tunnelDiv.appendChild(mainDiv);

  return tunnelDiv;
}

function initializeTunnel() {
  const rootElement = document.getElementById("body");
  rootElement.appendChild(createTunnel());
}

initializeTunnel();
