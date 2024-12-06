import * as fs from 'fs/promises';

export async function saveGraphAsImage(currentGraph : any) {
    const drawableGraph = currentGraph.getGraph();
    const image = await drawableGraph.drawMermaidPng();
    const arrayBuffer = await image.arrayBuffer();
    await fs.writeFile(`diagrams/${currentGraph.name}.png`, Buffer.from(arrayBuffer));
  }