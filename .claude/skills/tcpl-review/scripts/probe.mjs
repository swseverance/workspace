#!/usr/bin/env node
// Measures how well an exercise's tests tell right solutions from wrong ones,
// judged exactly as the site's grader judges a submission.
//
//   node .claude/skills/tcpl-review/scripts/probe.mjs <id> \
//     [--variants <dir>] [--candidates <file.json>] [--show <n>]
//
// <id>          exercise id, e.g. 1-21 or 1-13a
// --variants    directory of .c files. `ok-*.c` are solutions believed
//               correct; every other .c file is a solution believed wrong.
// --candidates  JSON array of inputs that might become tests:
//               { name?, stdin?, args?, files?, program?, expected? }
// --show        most candidates to print per section (default 40)
//
// Reads the exercise's tests and reference solution from exercise.ts, and
// the grader's comparison from output-diff.ts, so it can't drift from them.

import { build } from 'esbuild';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(import.meta.dirname, '../../../..');
const APP_SRC = join(ROOT, 'apps/tcpl-exercises/src');

// As in run-c.ts. Check there if these look out of date.
const GRADER_TIMEOUT_MS = 250;
const GRADER_OUTPUT_LIMIT = 64 * 1024;
// Generous, so a slow machine doesn't look like a failing program; runs
// slower than the grader's limit are reported separately.
const LOCAL_TIMEOUT_MS = 3000;

function usage(message) {
  if (message) console.error(`${message}\n`);
  console.error(
    'usage: probe.mjs <id> [--variants <dir>] [--candidates <file.json>] [--show <n>]',
  );
  process.exit(2);
}

const argv = process.argv.slice(2);
const options = { show: 40 };
let id;
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--variants') options.variants = argv[++i];
  else if (arg === '--candidates') options.candidates = argv[++i];
  else if (arg === '--show') options.show = Number(argv[++i]);
  else if (arg.startsWith('--')) usage(`unknown option ${arg}`);
  else if (!id) id = arg;
  else usage(`unexpected argument ${arg}`);
}
const idMatch = /^(\d+)-(\d+[a-z]?)$/.exec(id ?? '');
if (!idMatch) usage('give an exercise id such as 1-21');

const work = mkdtempSync(join(tmpdir(), 'tcpl-review-'));
process.on('exit', () => rmSync(work, { recursive: true, force: true }));

const q = (text) => JSON.stringify(text);
const short = (text, max = 70) => {
  const quoted = q(text);
  return quoted.length <= max
    ? quoted
    : `${quoted.slice(0, max - 1)}…" (${text.length} chars)`;
};

// --- The exercise and the grader's comparison --------------------------

const exercisePath = join(
  APP_SRC,
  'server/exercises',
  idMatch[1],
  idMatch[2],
  'exercise.ts',
);
const bundlePath = join(work, 'bundle.mjs');
try {
  await build({
    stdin: {
      contents: `
        export * as source from ${q(exercisePath)};
        export { outputMatches } from ${q(join(APP_SRC, 'shared/output-diff.ts'))};
        export { DEFAULT_PROGRAM } from ${q(join(APP_SRC, 'shared/models.ts'))};
      `,
      resolveDir: ROOT,
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'node',
    outfile: bundlePath,
    loader: { '.md': 'text', '.c': 'text' },
    plugins: [
      {
        // This esbuild rejects `with { type: 'text' }`; the loaders above
        // do the same job once the attribute is gone.
        name: 'text-imports',
        setup(b) {
          b.onLoad({ filter: /[\\/]exercises[\\/].*\.ts$/ }, (args) => ({
            contents: readFileSync(args.path, 'utf8').replace(
              /\s+with\s*\{\s*type:\s*['"]text['"]\s*\}/g,
              '',
            ),
            loader: 'ts',
          }));
        },
      },
    ],
    logLevel: 'silent',
  });
} catch (error) {
  console.error(`Can't load exercise ${id} from ${exercisePath}:`);
  console.error(error.message);
  process.exit(2);
}
const { source, outputMatches, DEFAULT_PROGRAM } = await import(
  pathToFileURL(bundlePath).href
);
const exercise = Object.values(source).find((value) => value?.tests);
if (!exercise) usage(`no exercise exported from ${exercisePath}`);

// --- Compiling and running --------------------------------------------

let binCount = 0;
function compile(name, code, extraFlags = []) {
  const dir = join(work, `bin${binCount++}`);
  mkdirSync(dir);
  writeFileSync(join(dir, 'main.c'), code);
  const bin = join(dir, 'main');
  const result = spawnSync(
    'gcc',
    ['-Wall', '-std=c17', ...extraFlags, '-o', bin, join(dir, 'main.c'), '-lm'],
    { encoding: 'utf8' },
  );
  return {
    name,
    bin: result.status === 0 ? bin : null,
    messages: result.stderr.trim(),
  };
}

let runCount = 0;
function run(program, input) {
  const cwd = join(work, `run${runCount++}`);
  mkdirSync(cwd);
  for (const file of input.files ?? []) {
    writeFileSync(join(cwd, file.name), file.content);
  }
  const started = performance.now();
  const result = spawnSync(program.bin, input.args ?? [], {
    argv0: input.program ?? DEFAULT_PROGRAM,
    cwd,
    input: input.stdin ?? '',
    timeout: LOCAL_TIMEOUT_MS,
    maxBuffer: 16 * 1024 * 1024,
    env: { ...process.env, ASAN_OPTIONS: 'detect_leaks=0' },
  });
  const ms = performance.now() - started;
  rmSync(cwd, { recursive: true, force: true });
  // Like run-c.ts: invalid UTF-8 becomes U+FFFD.
  const stdout = (result.stdout ?? Buffer.alloc(0)).toString('utf8');
  return {
    stdout,
    stderr: (result.stderr ?? Buffer.alloc(0)).toString('utf8'),
    // null when killed by a signal or the timeout.
    code: result.status,
    ms,
  };
}

/** Whether the grader would pass this run against this expected output. */
const passes = (result, expected) =>
  result.code === 0 && outputMatches(result.stdout, expected);

/** Whether the grader could tell two runs apart. */
const sameToGrader = (a, b) =>
  (a.code === 0) === (b.code === 0) &&
  (a.code !== 0 || outputMatches(a.stdout, b.stdout));

const inputKey = (input) =>
  q([
    input.stdin ?? '',
    input.args ?? [],
    input.program ?? DEFAULT_PROGRAM,
    input.files ?? [],
  ]);
const inputSize = (input) =>
  (input.stdin ?? '').length + (input.args ?? []).join(' ').length;
const describeInput = (input) =>
  [
    input.args?.length ? `args ${q(input.args)}` : '',
    input.files?.length ? `files ${q(input.files.map((f) => f.name))}` : '',
    `stdin ${short(input.stdin ?? '')}`,
  ]
    .filter(Boolean)
    .join(', ');

let problems = 0;
const problem = (text) => {
  problems++;
  console.log(`  !! ${text}`);
};

// --- 1. The reference solution against the existing tests -------------

console.log(`# Exercise ${exercise.id}: ${exercise.title}`);
console.log(
  `\n## Reference solution on the ${exercise.tests.length} existing tests`,
);

const references = [
  ['main.c', exercise.solution],
  ...(exercise.laterSolution
    ? [['later solution', exercise.laterSolution]]
    : []),
].map(([name, code]) => ({
  ...compile(name, code),
  // A second build that stops on undefined behaviour and memory errors.
  checked: compile(`${name} (sanitized)`, code, [
    '-g',
    '-fsanitize=address,undefined',
    '-fno-sanitize-recover=all',
  ]),
}));

for (const reference of references) {
  if (!reference.bin) {
    problem(`${reference.name} doesn't compile:\n${reference.messages}`);
    process.exit(1);
  }
  if (reference.messages) {
    problem(`${reference.name} compiles with warnings:\n${reference.messages}`);
  }
}
function checkReference(input, label) {
  const results = references.map((ref) => ({ ref, result: run(ref, input) }));
  for (const { ref, result } of results) {
    if (result.code !== 0) {
      problem(
        `${ref.name} exits with ${result.code ?? 'a signal or timeout'} on ${label}`,
      );
    }
    if (result.ms > GRADER_TIMEOUT_MS) {
      problem(
        `${ref.name} took ${Math.round(result.ms)}ms on ${label}; the grader allows ${GRADER_TIMEOUT_MS}ms`,
      );
    }
    if (Buffer.byteLength(result.stdout) > GRADER_OUTPUT_LIMIT) {
      problem(
        `${ref.name} prints more than the grader's output limit on ${label}`,
      );
    }
    if (ref.checked.bin) {
      const checked = run(ref.checked, input);
      if (checked.code !== 0) {
        problem(
          `${ref.name} has undefined behaviour or a memory error on ${label}:\n` +
            checked.stderr.split('\n').slice(0, 6).join('\n'),
        );
      }
    }
  }
  if (
    results.length > 1 &&
    !sameToGrader(results[0].result, results[1].result)
  ) {
    problem(`the two reference solutions disagree on ${label}`);
  }
  return results[0].result;
}

const before = problems;
const seenInputs = new Map();
for (const test of exercise.tests) {
  const label = `test ${test.id}`;
  const result = checkReference(test, label);
  if (!passes(result, test.expectedStdout)) {
    problem(
      `main.c fails ${label}: expected ${short(test.expectedStdout)}, got ${short(result.stdout)}`,
    );
  } else if (result.stdout !== test.expectedStdout) {
    problem(
      `${label}: main.c prints ${short(result.stdout)} but expectedStdout is ` +
        `${short(test.expectedStdout)}; the grader can't see the difference, the spec can`,
    );
  }
  const key = inputKey(test);
  if (seenInputs.has(key)) {
    problem(`${label} has the same input as test ${seenInputs.get(key)}`);
  }
  seenInputs.set(key, test.id);
}
if (problems === before) console.log('  all pass, cleanly');

// --- 2. Variants against the existing tests ---------------------------

const variants = [];
if (options.variants) {
  const dir = resolve(options.variants);
  for (const file of readdirSync(dir)
    .filter((f) => f.endsWith('.c'))
    .sort()) {
    const program = compile(file, readFileSync(join(dir, file), 'utf8'));
    variants.push({
      ...program,
      believedCorrect: basename(file).startsWith('ok-'),
      failed: [],
    });
  }
}

const survivors = [];
if (variants.length) {
  console.log(`\n## ${variants.length} variants on the existing tests`);
  for (const variant of variants) {
    if (!variant.bin) {
      problem(
        `${variant.name} doesn't compile, so it shows nothing:\n${variant.messages}`,
      );
      continue;
    }
    for (const test of exercise.tests) {
      if (!passes(run(variant, test), test.expectedStdout)) {
        variant.failed.push(test.id);
      }
    }
    const failed = variant.failed.length
      ? `fails ${variant.failed.length} (${variant.failed.slice(0, 4).join(', ')}${variant.failed.length > 4 ? ', …' : ''})`
      : 'passes every test';
    if (variant.believedCorrect) {
      if (variant.failed.length) {
        problem(
          `${variant.name} is believed correct but ${failed}: decide from the description which is wrong`,
        );
      } else {
        console.log(`  ok        ${variant.name}`);
      }
    } else if (variant.failed.length) {
      console.log(`  caught    ${variant.name}: ${failed}`);
    } else {
      console.log(`  SURVIVES  ${variant.name}: ${failed}`);
      survivors.push(variant);
    }
  }
  const wrong = variants.filter((v) => v.bin && !v.believedCorrect);
  console.log(
    `\n  ${wrong.length - survivors.length} of ${wrong.length} wrong variants caught; ${survivors.length} survive`,
  );
}

// --- 3. Candidate inputs ----------------------------------------------

if (options.candidates) {
  const candidates = JSON.parse(
    readFileSync(resolve(options.candidates), 'utf8'),
  );
  console.log(`\n## ${candidates.length} candidate inputs`);

  const correct = variants.filter((v) => v.bin && v.believedCorrect);
  const invisibleOnly = new Map(survivors.map((v) => [v.name, null]));
  const useful = [];
  const disagreements = [];
  let duplicates = 0;

  candidates.forEach((candidate, index) => {
    const label = candidate.name ?? `candidate ${index}`;
    if (seenInputs.has(inputKey(candidate))) {
      duplicates++;
      return;
    }
    const expected = checkReference(candidate, label);
    if (
      candidate.expected !== undefined &&
      !passes(expected, candidate.expected)
    ) {
      problem(
        `${label}: you expected ${short(candidate.expected)} but main.c prints ` +
          `${short(expected.stdout)}. Decide from the description which is right.`,
      );
    }
    for (const variant of correct) {
      if (!sameToGrader(run(variant, candidate), expected)) {
        disagreements.push({ candidate, label, variant: variant.name });
      }
    }
    const kills = [];
    for (const variant of survivors) {
      const result = run(variant, candidate);
      if (!sameToGrader(result, expected)) {
        kills.push(variant.name);
      } else if (
        result.stdout !== expected.stdout &&
        !invisibleOnly.get(variant.name)
      ) {
        invisibleOnly.set(variant.name, {
          candidate,
          got: result.stdout,
          want: expected.stdout,
        });
      }
    }
    if (kills.length) useful.push({ candidate, label, kills, expected });
  });

  if (duplicates) {
    console.log(`  ${duplicates} skipped: same input as an existing test`);
  }

  if (disagreements.length) {
    console.log('\n### Solutions believed correct that disagree with main.c');
    console.log(
      '  Each is a bug in one of them or a gap in the description. Settle it from the description.',
    );
    for (const { label, candidate, variant } of disagreements.slice(
      0,
      options.show,
    )) {
      problem(`${variant} on ${label}: ${describeInput(candidate)}`);
    }
    if (disagreements.length > options.show) {
      console.log(`  … and ${disagreements.length - options.show} more`);
    }
  }

  // Fewest, shortest inputs that between them catch every catchable
  // survivor: most new catches first, shorter input on a tie.
  const uncaught = new Set(survivors.map((v) => v.name));
  const chosen = [];
  for (;;) {
    let best = null;
    for (const item of useful) {
      const gain = item.kills.filter((name) => uncaught.has(name)).length;
      if (
        gain > 0 &&
        (!best ||
          gain > best.gain ||
          (gain === best.gain &&
            inputSize(item.candidate) < inputSize(best.item.candidate)))
      ) {
        best = { item, gain };
      }
    }
    if (!best) break;
    chosen.push({
      ...best.item,
      newKills: best.item.kills.filter((name) => uncaught.has(name)),
    });
    for (const name of best.item.kills) uncaught.delete(name);
  }

  if (survivors.length) {
    console.log('\n### Smallest set of candidates that catches the survivors');
    if (!chosen.length)
      console.log('  none of the candidates catches a survivor');
    for (const { candidate, label, newKills, expected } of chosen.slice(
      0,
      options.show,
    )) {
      console.log(`\n  ${label}: ${describeInput(candidate)}`);
      console.log(`    main.c prints ${q(expected.stdout)}`);
      console.log(`    catches ${newKills.join(', ')}`);
    }

    console.log('\n### Survivors no candidate catches');
    if (!uncaught.size) console.log('  none');
    for (const name of uncaught) {
      const invisible = invisibleOnly.get(name);
      console.log(
        invisible
          ? `  ${name}: its output differs only where the grader doesn't look, e.g. ` +
              `${describeInput(invisible.candidate)} gives ${short(invisible.got)} for ${short(invisible.want)}`
          : `  ${name}: same output as main.c on every candidate`,
      );
    }
  }
}

console.log(
  problems
    ? `\n${problems} problem${problems === 1 ? '' : 's'} marked !! above.`
    : '\nNo problems marked.',
);
