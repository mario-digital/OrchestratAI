#!/usr/bin/env bun
/**
 * Enum Synchronization Validator
 *
 * Validates that TypeScript and Python enums are synchronized.
 * This ensures the frontend and backend share the same enum values,
 * preventing runtime validation errors and API contract breakage.
 *
 * Usage:
 *   bun run scripts/validate-enums.ts
 *
 * Exit Codes:
 *   0 - All enums are synchronized
 *   1 - Enum synchronization failed or file read error
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface EnumDefinition {
  name: string;
  values: Record<string, string>;
}

/**
 * Parse TypeScript enum definitions from a file
 *
 * Matches patterns like:
 *   export enum EnumName {
 *     KEY = 'value',
 *   }
 */
function parseTSEnums(filePath: string): EnumDefinition[] {
  const content = readFileSync(filePath, 'utf-8');
  const enums: EnumDefinition[] = [];

  // Match: export enum EnumName { ... }
  const enumRegex = /export enum (\w+)\s*{([^}]+)}/g;
  let match;

  while ((match = enumRegex.exec(content)) !== null) {
    const [, name, body] = match;
    const values: Record<string, string> = {};

    // Match: KEY = 'value', or KEY = "value",
    const valueRegex = /(\w+)\s*=\s*['"]([^'"]+)['"]/g;
    let valueMatch;

    while ((valueMatch = valueRegex.exec(body)) !== null) {
      values[valueMatch[1]] = valueMatch[2];
    }

    enums.push({ name, values });
  }

  return enums;
}

/**
 * Parse Python enum definitions from a file
 *
 * Matches patterns like:
 *   class EnumName(str, Enum):
 *       KEY = "value"
 */
function parsePyEnums(filePath: string): EnumDefinition[] {
  const content = readFileSync(filePath, 'utf-8');
  const enums: EnumDefinition[] = [];

  // Match: class EnumName(str, Enum): or class EnumName(Enum):
  const enumRegex = /class (\w+)\(.*?Enum\):([^]*?)(?=class |$)/g;
  let match;

  while ((match = enumRegex.exec(content)) !== null) {
    const [, name, body] = match;
    const values: Record<string, string> = {};

    // Match: KEY = "value" or KEY = 'value'
    const valueRegex = /(\w+)\s*=\s*["']([^"']+)["']/g;
    let valueMatch;

    while ((valueMatch = valueRegex.exec(body)) !== null) {
      values[valueMatch[1]] = valueMatch[2];
    }

    enums.push({ name, values });
  }

  return enums;
}

/**
 * Compare TypeScript and Python enum definitions
 *
 * Checks for:
 *   1. Missing enums (exists in one but not the other)
 *   2. Different keys (enum has different members)
 *   3. Different values (same key, different value)
 */
function compareEnums(
  tsEnums: EnumDefinition[],
  pyEnums: EnumDefinition[]
): { success: boolean; errors: string[] } {
  const errors: string[] = [];

  // Create maps for easy lookup
  const tsMap = new Map(tsEnums.map(e => [e.name, e]));
  const pyMap = new Map(pyEnums.map(e => [e.name, e]));

  // Check TypeScript enums exist in Python
  for (const [name, tsEnum] of tsMap) {
    const pyEnum = pyMap.get(name);

    if (!pyEnum) {
      errors.push(`❌ Enum "${name}" exists in TypeScript but not in Python`);
      errors.push(`   Add to: orchestratai_api/src/models/enums.py`);
      continue;
    }

    // Check keys match
    const tsKeys = Object.keys(tsEnum.values).sort();
    const pyKeys = Object.keys(pyEnum.values).sort();

    if (tsKeys.join(',') !== pyKeys.join(',')) {
      errors.push(`❌ Enum "${name}" has different keys:`);
      errors.push(`   TypeScript: [${tsKeys.join(', ')}]`);
      errors.push(`   Python:     [${pyKeys.join(', ')}]`);

      // Show which keys are missing
      const tsSet = new Set(tsKeys);
      const pySet = new Set(pyKeys);

      const missingInPy = tsKeys.filter(k => !pySet.has(k));
      const missingInTs = pyKeys.filter(k => !tsSet.has(k));

      if (missingInPy.length > 0) {
        errors.push(`   Missing in Python: ${missingInPy.join(', ')}`);
      }
      if (missingInTs.length > 0) {
        errors.push(`   Missing in TypeScript: ${missingInTs.join(', ')}`);
      }

      continue;
    }

    // Check values match
    for (const key of tsKeys) {
      const tsValue = tsEnum.values[key];
      const pyValue = pyEnum.values[key];

      if (tsValue !== pyValue) {
        errors.push(`❌ Enum "${name}.${key}" has different values:`);
        errors.push(`   TypeScript: "${tsValue}"`);
        errors.push(`   Python:     "${pyValue}"`);
      }
    }
  }

  // Check Python enums exist in TypeScript
  for (const [name, pyEnum] of pyMap) {
    if (!tsMap.has(name)) {
      errors.push(`❌ Enum "${name}" exists in Python but not in TypeScript`);
      errors.push(`   Add to: orchestratai_client/src/lib/enums.ts`);
    }
  }

  return {
    success: errors.length === 0,
    errors,
  };
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Validating enum synchronization...\n');

  const TS_ENUMS_PATH = join(process.cwd(), 'orchestratai_client/src/lib/enums.ts');
  const PY_ENUMS_PATH = join(process.cwd(), 'orchestratai_api/src/models/enums.py');

  try {
    // Parse enums from both files
    const tsEnums = parseTSEnums(TS_ENUMS_PATH);
    const pyEnums = parsePyEnums(PY_ENUMS_PATH);

    console.log(`📄 Found ${tsEnums.length} TypeScript enum(s):`);
    tsEnums.forEach(e => console.log(`   - ${e.name} (${Object.keys(e.values).length} values)`));

    console.log(`\n🐍 Found ${pyEnums.length} Python enum(s):`);
    pyEnums.forEach(e => console.log(`   - ${e.name} (${Object.keys(e.values).length} values)`));

    console.log('\n⚖️  Comparing enums...\n');

    // Compare enums
    const result = compareEnums(tsEnums, pyEnums);

    if (result.success) {
      console.log('✅ All enums are synchronized!');
      console.log('\n✨ Frontend and backend enum definitions match perfectly.');
      process.exit(0);
    } else {
      console.error('❌ Enum synchronization failed!\n');
      console.error('The following issues were found:\n');
      result.errors.forEach(error => console.error(error));
      console.error('\n💡 Fix these enum mismatches before committing.');
      console.error('   Ensure frontend/lib/enums.ts and backend/models/enums.py match exactly.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error reading enum files:\n');

    if (error instanceof Error) {
      console.error(error.message);

      if (error.message.includes('ENOENT')) {
        console.error('\n💡 Make sure enum files exist at:');
        console.error(`   - ${TS_ENUMS_PATH}`);
        console.error(`   - ${PY_ENUMS_PATH}`);
      }
    } else {
      console.error(error);
    }

    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main();
}
