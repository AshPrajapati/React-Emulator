import * as Babel from '@babel/standalone';

/**
 * Transforms JSX code to executable JavaScript using Babel.
 * Auto-injects React imports and handles errors gracefully.
 *
 * @param {string} code - The user's JSX code
 * @returns {{ success: boolean, code?: string, error?: string }}
 */
export function transformCode(code) {
  try {
    // Check for unavailable package imports
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
    const allowedPackages = ['react', 'react-dom'];
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      const packageName = match[1];
      // Allow relative imports and allowed packages
      if (!packageName.startsWith('.') && !packageName.startsWith('/')) {
        if (!allowedPackages.includes(packageName.toLowerCase())) {
          return {
            success: false,
            error: `"${packageName}" is not available. Only React is available in this playground.`
          };
        }
      }
    }

    // Auto-inject React import if not present
    let processedCode = code;
    if (!code.includes("import React") && !code.includes("import * as React")) {
      processedCode = `import React from 'react';\n${code}`;
    }

    // Transform JSX to JavaScript using Babel
    const result = Babel.transform(processedCode, {
      presets: ['react'],
      filename: 'usercode.jsx',
    });

    return {
      success: true,
      code: result.code
    };
  } catch (error) {
    // Extract meaningful error message
    let errorMessage = error.message || 'Unknown transformation error';

    // Clean up Babel error messages to be more user-friendly
    if (errorMessage.includes('usercode.jsx:')) {
      errorMessage = errorMessage.replace('usercode.jsx:', 'Line ');
    }

    return {
      success: false,
      error: errorMessage
    };
  }
}
