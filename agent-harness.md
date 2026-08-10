# Agent Harness: verified AI execution

This ControlStackAI case study describes a provider-independent agent harness that accepts a contract, executes it durably, verifies the outcome outside the executor, and returns signed evidence.

Canonical page: https://controlstackai.com/agent-harness

## The problem

As model generation improves, deciding whether completed work deserves trust becomes the limiting system. A transcript can show what an agent said and did without proving that the requested outcome was achieved.

## Execution path

1. Contract: define intent, completion criteria, reviewer criteria, budgets, and constraints before execution.
2. Execute: use an in-process model, a local model, or an existing coding-agent subscription behind the same contract.
3. Verify: run deterministic checks and adversarial review in contexts separate from the executor.
4. Verdict: store the run, evidence, and decision in a signed, hash-chained ledger.

## Architecture and guarantees

- Durable state: work can suspend, survive a crash, and resume without repeating completed steps.
- Provider-independent core: provider and executor adapters can change without changing the trust path.
- Boundary enforcement: budgets, deadlines, tool permissions, and filesystem scope are enforced where actions happen.
- Private evidence: run content stays local, while hashes can provide external tamper evidence without publishing the underlying work.
- Independent acceptance: completion and acceptance are separate jobs; the executor does not grade its own work.
- Evaluation: paired runs and benchmark adapters measure pass rate, cost, and user outcomes.
- Explicit integration seams: providers, tools, context sources, and event consumers attach through defined boundaries.

## What this demonstrates

The system is a working reference architecture for governed agent execution. Its patterns apply to production workflows that need contracts, policy controls, independent verification, resumability, and auditable evidence even when the exact harness is different.

To discuss applying these guarantees to a workflow, visit https://controlstackai.com/contact.
