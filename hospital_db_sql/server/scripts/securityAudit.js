import fs from 'fs';
import path from 'path';

/**
 * Requirement 8: Automated SAST (Static Application Security Testing) Code Scanner
 */
export function runSastScan(targetDir = process.cwd()) {
  console.log(`\n====================================================`);
  console.log(`🛡️  SAST (Static Application Security Testing) SCANNER`);
  console.log(`====================================================\n`);

  const issues = [];
  let filesScanned = 0;

  const VULN_RULES = [
    {
      id: 'SEC-001',
      severity: 'HIGH',
      name: 'Hardcoded Secret or Credentials',
      pattern: /(?:password|secret|api_key|private_key)\s*[:=]\s*["'][a-zA-Z0-9_\-]{8,}["']/i,
      excludeFiles: ['securityAudit.js', 'test/securitySuite.test.js', 'auth.js']
    },
    {
      id: 'SEC-002',
      severity: 'CRITICAL',
      name: 'Insecure eval() or Function Constructor',
      pattern: /\beval\(|\bnew\s+Function\(/g,
      excludeFiles: ['sqlSandbox.js'] // Allowed inside sql.js WASM bridge
    },
    {
      id: 'SEC-003',
      severity: 'MEDIUM',
      name: 'Insecure Math.random() Usage for Security Tokens',
      pattern: /Math\.random\(\)/g,
      excludeFiles: []
    },
    {
      id: 'SEC-004',
      severity: 'HIGH',
      name: 'Dangerous HTML Injection / innerHTML',
      pattern: /dangerouslySetInnerHTML|\.innerHTML\s*=/g,
      excludeFiles: []
    }
  ];

  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
        filesScanned++;
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        VULN_RULES.forEach(rule => {
          if (rule.excludeFiles.some(f => entry.name.includes(f))) return;

          lines.forEach((line, idx) => {
            if (rule.pattern.test(line)) {
              issues.push({
                ruleId: rule.id,
                severity: rule.severity,
                name: rule.name,
                file: path.relative(targetDir, fullPath),
                line: idx + 1,
                snippet: line.trim()
              });
            }
          });
        });
      }
    }
  }

  scanDirectory(path.join(targetDir, 'server'));
  scanDirectory(path.join(targetDir, 'src'));

  console.log(`📊 Total Files Scanned: ${filesScanned}`);
  console.log(`⚠️  Total Vulnerabilities / SAST Issues Found: ${issues.length}\n`);

  issues.forEach(issue => {
    console.log(`[${issue.severity}] ${issue.ruleId}: ${issue.name}`);
    console.log(`   File: ${issue.file}:${issue.line}`);
    console.log(`   Snippet: "${issue.snippet}"\n`);
  });

  return {
    filesScanned,
    issuesCount: issues.length,
    issues
  };
}

if (process.argv[1] && process.argv[1].endsWith('securityAudit.js')) {
  runSastScan();
}
