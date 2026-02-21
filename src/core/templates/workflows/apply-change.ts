/**
 * 实现变更工作流模板
 *
 * 按任务清单逐项实现代码变更。
 */
import type { SkillTemplate, CommandTemplate } from '../types.js';

export function getApplyChangeSkillTemplate(): SkillTemplate {
  return {
    name: 'openspec-apply-change',
    description: '按任务清单实现 OpenSpec 变更。适用于开始实现、继续实现或逐项推进任务。',
    instructions: `Implement tasks from an OpenSpec change.

**Input**: Optionally specify a change name. If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run \`openspec list --json\` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., \`/opsx:apply <other>\`).

2. **Check status to understand the schema**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   Parse the JSON to understand:
   - \`schemaName\`: The workflow being used (e.g., "spec-driven")
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

3. **Get apply instructions**

   \`\`\`bash
   openspec instructions apply --change "<name>" --json
   \`\`\`

   This returns:
   - Context file paths (varies by schema - could be proposal/specs/design/tasks or spec/tests/implementation/docs)
   - Progress (total, complete, remaining)
   - Task list with status
   - Dynamic instruction based on current state

   **Handle states:**
   - If \`state: "blocked"\` (missing artifacts): show message, suggest using openspec-continue-change
   - If \`state: "all_done"\`: congratulate, suggest archive
   - Otherwise: proceed to implementation

4. **Read context files**

   Read the files listed in \`contextFiles\` from the apply instructions output.
   The files depend on the schema being used:
   - **spec-driven**: proposal, specs, design, tasks
   - Other schemas: follow the contextFiles from CLI output

5. **Create context anchor**

   After reading context files, output a brief **Context Anchor** summary using the files that exist for the current schema.
   If a section has no corresponding context file, mark it as \`N/A\` instead of guessing.

   \\\`\\\`\\\`
   ## Context Anchor
   **Requirements**: <from specs/requirements docs; or N/A>
   **Design Decisions**: <from design/architecture docs; or N/A>
   **Scope Boundaries**: <from proposal/planning docs; or N/A>
   **Test Strategy**: <test framework + test location convention; or N/A>
   \\\`\\\`\\\`

   This anchor prevents context drift in long conversations.
   If at any point you're uncertain about a requirement, re-read the relevant context file rather than guessing.

6. **Show current progress**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Dynamic instruction from CLI

7. **Implement tasks with a test-first approach (loop until done or blocked)**

   For each pending task:

   - If the task changes behavior, follow the **Red-Green-Refactor** cycle:
     a. **Red (Write Tests First)**:
        - Identify what the task requires based on specs and design
        - Write test(s) that validate the expected behavior
        - Run tests — confirm they FAIL (proving the feature doesn't exist yet)
        - If no test framework is configured: set one up as the first task, or ask the user
     b. **Green (Minimal Implementation)**:
        - Write the minimum code needed to make tests pass
        - Run tests — confirm they PASS
        - Do NOT add extra functionality beyond what the test requires
     c. **Refactor (Clean Up)**:
        - Improve code quality without changing behavior
        - Run tests — confirm they still PASS
        - Only refactor if genuinely needed; skip for trivial tasks

   - If the task is non-behavioral (docs, config, scaffolding, mechanical refactor):
     a. Make the minimal required change
     b. Run the most relevant validation available (lint, typecheck, build, smoke checks)
     c. Record why no new automated test was added

   d. **Mark complete**: \`- [ ]\` → \`- [x]\`
   e. Continue to next task

   **Regression check**: After every 3 tasks, run a broader validation pass (full test suite when available; otherwise lint/typecheck/build).

   **Pause if:**
   - Task is unclear → ask for clarification
   - Test is hard to write → may indicate unclear requirements, re-read spec
   - Implementation reveals a design issue → suggest updating artifacts
   - Error or blocker encountered → report and wait for guidance
   - User interrupts

8. **On completion or pause, show status**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - If all done: suggest archive
   - If paused: explain why and wait for guidance

**Output During Implementation**

\`\`\`
## Implementing: <change-name> (schema: <schema-name>)

Working on task 3/7: <task description>
  RED: Writing test for <expected behavior>...
  Running tests... 1 failing ✓ (expected)
  GREEN: Implementing <minimal code>...
  Running tests... all passing ✓
✓ Task complete

Working on task 4/7: <task description>
  RED: Writing test for <expected behavior>...
  Running tests... 1 failing ✓ (expected)
  GREEN: Implementing <minimal code>...
  Running tests... all passing ✓
✓ Task complete
\`\`\`

**Output On Completion**

\`\`\`
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tasks complete! Ready to archive this change.
\`\`\`

**Output On Pause (Issue Encountered)**

\`\`\`
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
\`\`\`

**Guardrails**
- Prefer TDD for behavior-changing tasks; if a task is non-behavioral, explicitly document the alternate validation used
- If behavior-changing work has no test framework, set one up as the first task (or ask user)
- Run validation after each task completion (tests when present; otherwise best available checks)
- Each behavior-changing completed task should have at least one automated test proving it works
- Keep going through tasks until done or blocked
- Always read context files before starting (from the apply instructions output)
- If task is ambiguous, pause and ask before implementing
- If implementation reveals issues, pause and suggest artifact updates
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
- Pause on errors, blockers, or unclear requirements - don't guess
- Use contextFiles from CLI output, don't assume specific file names

**Fluid Workflow Integration**

This skill supports the "actions on a change" model:

- **Can be invoked anytime**: Before all artifacts are done (if tasks exist), after partial implementation, interleaved with other actions
- **Allows artifact updates**: If implementation reveals design issues, suggest updating artifacts - not phase-locked, work fluidly`,
    license: 'MIT',
    compatibility: 'Requires openspec CLI.',
    metadata: { author: 'openspec', version: '1.0' },
  };
}

export function getOpsxApplyCommandTemplate(): CommandTemplate {
  return {
    name: 'OPSX: Apply',
    description: '按任务清单实现 OpenSpec 变更',
    category: 'Workflow',
    tags: ['workflow', 'artifacts', 'experimental'],
    content: `Implement tasks from an OpenSpec change.

**Input**: Optionally specify a change name (e.g., \`/opsx:apply add-auth\`). If omitted, check if it can be inferred from conversation context. If vague or ambiguous you MUST prompt for available changes.

**Steps**

1. **Select the change**

   If a name is provided, use it. Otherwise:
   - Infer from conversation context if the user mentioned a change
   - Auto-select if only one active change exists
   - If ambiguous, run \`openspec list --json\` to get available changes and use the **AskUserQuestion tool** to let the user select

   Always announce: "Using change: <name>" and how to override (e.g., \`/opsx:apply <other>\`).

2. **Check status to understand the schema**
   \`\`\`bash
   openspec status --change "<name>" --json
   \`\`\`
   Parse the JSON to understand:
   - \`schemaName\`: The workflow being used (e.g., "spec-driven")
   - Which artifact contains the tasks (typically "tasks" for spec-driven, check status for others)

3. **Get apply instructions**

   \`\`\`bash
   openspec instructions apply --change "<name>" --json
   \`\`\`

   This returns:
   - Context file paths (varies by schema)
   - Progress (total, complete, remaining)
   - Task list with status
   - Dynamic instruction based on current state

   **Handle states:**
   - If \`state: "blocked"\` (missing artifacts): show message, suggest using \`/opsx:continue\`
   - If \`state: "all_done"\`: congratulate, suggest archive
   - Otherwise: proceed to implementation

4. **Read context files**

   Read the files listed in \`contextFiles\` from the apply instructions output.
   The files depend on the schema being used:
   - **spec-driven**: proposal, specs, design, tasks
   - Other schemas: follow the contextFiles from CLI output

5. **Create context anchor**

   After reading context files, output a brief **Context Anchor** summary using the files that exist for the current schema.
   If a section has no corresponding context file, mark it as \`N/A\` instead of guessing.

   \\\`\\\`\\\`
   ## Context Anchor
   **Requirements**: <from specs/requirements docs; or N/A>
   **Design Decisions**: <from design/architecture docs; or N/A>
   **Scope Boundaries**: <from proposal/planning docs; or N/A>
   **Test Strategy**: <test framework + test location convention; or N/A>
   \\\`\\\`\\\`

   This anchor prevents context drift in long conversations.
   If at any point you're uncertain about a requirement, re-read the relevant context file rather than guessing.

6. **Show current progress**

   Display:
   - Schema being used
   - Progress: "N/M tasks complete"
   - Remaining tasks overview
   - Dynamic instruction from CLI

7. **Implement tasks with a test-first approach (loop until done or blocked)**

   For each pending task:

   - If the task changes behavior, follow the **Red-Green-Refactor** cycle:
     a. **Red (Write Tests First)**:
        - Identify what the task requires based on specs and design
        - Write test(s) that validate the expected behavior
        - Run tests — confirm they FAIL (proving the feature doesn't exist yet)
        - If no test framework is configured: set one up as the first task, or ask the user
     b. **Green (Minimal Implementation)**:
        - Write the minimum code needed to make tests pass
        - Run tests — confirm they PASS
        - Do NOT add extra functionality beyond what the test requires
     c. **Refactor (Clean Up)**:
        - Improve code quality without changing behavior
        - Run tests — confirm they still PASS
        - Only refactor if genuinely needed; skip for trivial tasks

   - If the task is non-behavioral (docs, config, scaffolding, mechanical refactor):
     a. Make the minimal required change
     b. Run the most relevant validation available (lint, typecheck, build, smoke checks)
     c. Record why no new automated test was added

   d. **Mark complete**: \`- [ ]\` → \`- [x]\`
   e. Continue to next task

   **Regression check**: After every 3 tasks, run a broader validation pass (full test suite when available; otherwise lint/typecheck/build).

   **Pause if:**
   - Task is unclear → ask for clarification
   - Test is hard to write → may indicate unclear requirements, re-read spec
   - Implementation reveals a design issue → suggest updating artifacts
   - Error or blocker encountered → report and wait for guidance
   - User interrupts

8. **On completion or pause, show status**

   Display:
   - Tasks completed this session
   - Overall progress: "N/M tasks complete"
   - If all done: suggest archive
   - If paused: explain why and wait for guidance

**Output During Implementation**

\`\`\`
## Implementing: <change-name> (schema: <schema-name>)

Working on task 3/7: <task description>
  RED: Writing test for <expected behavior>...
  Running tests... 1 failing ✓ (expected)
  GREEN: Implementing <minimal code>...
  Running tests... all passing ✓
✓ Task complete

Working on task 4/7: <task description>
  RED: Writing test for <expected behavior>...
  Running tests... 1 failing ✓ (expected)
  GREEN: Implementing <minimal code>...
  Running tests... all passing ✓
✓ Task complete
\`\`\`

**Output On Completion**

\`\`\`
## Implementation Complete

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 7/7 tasks complete ✓

### Completed This Session
- [x] Task 1
- [x] Task 2
...

All tasks complete! You can archive this change with \`/opsx:archive\`.
\`\`\`

**Output On Pause (Issue Encountered)**

\`\`\`
## Implementation Paused

**Change:** <change-name>
**Schema:** <schema-name>
**Progress:** 4/7 tasks complete

### Issue Encountered
<description of the issue>

**Options:**
1. <option 1>
2. <option 2>
3. Other approach

What would you like to do?
\`\`\`

**Guardrails**
- Prefer TDD for behavior-changing tasks; if a task is non-behavioral, explicitly document the alternate validation used
- If behavior-changing work has no test framework, set one up as the first task (or ask user)
- Run validation after each task completion (tests when present; otherwise best available checks)
- Each behavior-changing completed task should have at least one automated test proving it works
- Keep going through tasks until done or blocked
- Always read context files before starting (from the apply instructions output)
- If task is ambiguous, pause and ask before implementing
- If implementation reveals issues, pause and suggest artifact updates
- Keep code changes minimal and scoped to each task
- Update task checkbox immediately after completing each task
- Pause on errors, blockers, or unclear requirements - don't guess
- Use contextFiles from CLI output, don't assume specific file names

**Fluid Workflow Integration**

This skill supports the "actions on a change" model:

- **Can be invoked anytime**: Before all artifacts are done (if tasks exist), after partial implementation, interleaved with other actions
- **Allows artifact updates**: If implementation reveals design issues, suggest updating artifacts - not phase-locked, work fluidly`
  };
}
