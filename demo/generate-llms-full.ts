import fs from 'fs/promises';
import path from 'path';

const PAGES_ROOT_DIR = 'pages';
const OUTPUT_FILENAME = 'llms-full.txt';

/**
 * Recursively finds all MDX files in a given directory.
 */
async function getMdxFiles(dir: string): Promise<string[]> {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getMdxFiles(res) : res;
    }),
  );
  return Array.prototype.concat(...files).filter((file: string) => file.endsWith('.mdx'));
}

/**
 * Cleans the markdown content by removing formatting and collapsing whitespace.
 */
function cleanMarkdown(content: string): string {
  let processed = content;
  // Collapses multiple blank lines into a single blank line
  processed = processed.replace(/(?:\s*\n){3,}/g, '\n\n');
  return processed.trim();
}

async function main(): Promise<void> {
  const pagesDir = path.resolve(process.cwd(), PAGES_ROOT_DIR);
  console.log(`Scanning for MDX files in: ${pagesDir}`);

  let allFiles: string[];
  try {
    allFiles = await getMdxFiles(pagesDir);
  } catch (error) {
    console.error(`Error: Failed to read pages directory "${pagesDir}".`);
    console.error('Please ensure you are running this script from the root of the demo project.');
    console.error((error as Error).message);
    process.exit(1);
  }

  console.log(`Found ${allFiles.length} MDX files to process.`);

  let finalOutput = '';

  for (const filePath of allFiles) {
    try {
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`  Processing: ${relativePath}`);
      const rawContent = await fs.readFile(filePath, 'utf-8');

      const cleanedContent = cleanMarkdown(rawContent);

      finalOutput += `\n\n`;
      finalOutput += cleanedContent;

    } catch (fileReadError) {
      console.warn(`  Warning: Could not read or process file "${filePath}". Skipping.`);
      console.warn(`  ${(fileReadError as Error).message}`);
    }
  }

  const outputFilePath = path.resolve(process.cwd(), OUTPUT_FILENAME);
  try {
    await fs.writeFile(outputFilePath, finalOutput.trim(), 'utf-8');
    console.log(`\n✅ Successfully generated combined file: ${outputFilePath}`);
  } catch (error) {
    console.error(`\nError: Failed to write output file "${outputFilePath}".`);
    console.error((error as Error).message);
    process.exit(1);
  }
}

main();
