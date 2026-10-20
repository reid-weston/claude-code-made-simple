// PreToolUse hook for git commit: run the tests first, and block the commit if any fail.
// Registered twice in settings.json, with "if": "Bash(git commit *)" and "PowerShell(git commit *)",
// so it runs whenever Claude commits, in either shell.
const { spawnSync } = require('node:child_process');

const project = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const r = spawnSync('npm', ['test'], { cwd: project, encoding: 'utf8', shell: true });

if (r.status !== 0) {
  const lines = `${r.stdout}\n${r.stderr}`.split('\n').filter((l) => /✖|not ok|Error/.test(l)).slice(0, 8);
  console.error('Blocked: npm test fails, so this commit would save broken work.\n' + lines.join('\n') +
    '\nFix the failing tests first, then commit.');
  process.exit(2);
}
process.exit(0);
