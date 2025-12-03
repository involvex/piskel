const fs = require('fs');
const path = require('path');

function fixTrailingCommas(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      fixTrailingCommas(fullPath);
    } else if (file.name.endsWith('.js')) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // Fix trailing commas in function calls and object literals
        // Pattern 1: ,\s*\);\s*$ -> );
        content = content.replace(/,\s*\);\s*$/gm, ');');
        
        // Pattern 2: ,\s*\}\s*$ -> }
        content = content.replace(/,\s*\}\s*$/gm, '}');
        
        // Pattern 3: ,\s*\]\s*$ -> ]
        content = content.replace(/,\s*\]\s*$/gm, ']');
        
        // Pattern 4: Multi-line function calls with trailing commas
        content = content.replace(/,\s*\n\s*\)/gm, '\n)');
        
        // Pattern 5: Multi-line object/array literals with trailing commas
        content = content.replace(/,\s*\n\s*\}/gm, '\n}');
        content = content.replace(/,\s*\n\s*\]/gm, '\n]');
        
        fs.writeFileSync(fullPath, content);
        console.log(`Fixed: ${fullPath}`);
      } catch (err) {
        console.error(`Error processing ${fullPath}:`, err.message);
      }
    }
  }
}

// Fix trailing commas in the src directory
fixTrailingCommas('./src');
console.log('Trailing comma fixes completed!');
