// PreToolUse hook: Claude may add new test files, but never change an existing one.
// Claude Code sends the planned edit as JSON on stdin. Exit 2 blocks it, and what we
// write to stderr is passed to Claude so it can change course.
const fs = require('node:fs');
const path = require('node:path');

let raw = '';
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  const input = JSON.parse(raw || '{}');
  const file = input.tool_input && input.tool_input.file_path;
  if (!file) process.exit(0);

  const project = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
  const rel = path.relative(project, path.resolve(project, file)).split(path.sep).join('/');
  const isTest = /^(tests|checks)\//.test(rel);

  if (isTest && fs.existsSync(path.resolve(project, file))) {
    console.error(`Blocked: ${rel} is an existing test. Tests define done, so they don't change. ` +
      'Fix the code instead, or add a new test in a new file.');
    process.exit(2);
  }
  process.exit(0);
});
