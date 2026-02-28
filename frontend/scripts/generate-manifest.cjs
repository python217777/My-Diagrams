const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '../..');
const diagramsDir = path.join(repoRoot, 'diagrams');
const outPath = path.join(repoRoot, 'frontend', 'public', 'diagrams-manifest.json');

function extractDiagramInfo(content, filename) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.md$/, '');
  const afterMermaid = content.replace(/[\s\S]*?```mermaid[\s\S]*?```/, '').trim();
  const descMatch = afterMermaid.match(/\*\*Description:\*\*\s*([^\n*]+)/) || afterMermaid.match(/^(.+?)(?:\n\n|\n\*\*)/s);
  const description = descMatch ? descMatch[1].replace(/\s+/g, ' ').trim().slice(0, 300) : '';
  return { id: filename.replace(/\.md$/, ''), file: filename, title, description };
}

function main() {
  if (!fs.existsSync(diagramsDir)) {
    fs.writeFileSync(outPath, JSON.stringify([], null, 2));
    console.log('No diagrams folder, wrote empty manifest.');
    return;
  }
  const files = fs.readdirSync(diagramsDir).filter((f) => f.endsWith('.md'));
  const manifest = files.map((file) => {
    const content = fs.readFileSync(path.join(diagramsDir, file), 'utf8');
    return extractDiagramInfo(content, file);
  });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
  console.log('Wrote diagrams-manifest.json with', manifest.length, 'diagrams.');
}

main();
