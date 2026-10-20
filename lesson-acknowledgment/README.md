# Lesson Policy Acknowledgment

Official ClassroomIO lesson contribution based on the original first-party donor UI.

The sandboxed Svelte plugin receives only a lesson resource identifier in its host-provided context. It reads and updates the current learner's completion through the public, permission-gated plugin SDK and stores its own per-user acknowledgment timestamp in plugin storage. It does not import dashboard stores, course services, or database code.

```bash
pnpm --filter @classroomio/official-plugin-lesson-acknowledgment build
```
