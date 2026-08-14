# Budget Creation Specification

## Purpose

Define route-based Budget creation as a complete, recoverable, and atomic operation.

## Requirements

### Requirement: Route-Based Budget Creation

The system MUST expose authenticated Budget creation at `/budget/create` and MUST remove the legacy creation sheet entry point. The route MUST render six editable initial plan groups and MUST permit editing group names, adding or removing groups and items, and changing planned amounts.

#### Scenario: Start an editable plan
- GIVEN an authenticated user opens `/budget/create`
- WHEN the form loads
- THEN it displays Budget metadata including color and six editable groups
- AND the user can edit groups, items, and amounts before saving

#### Scenario: Prevent an empty plan
- GIVEN the user removes every group
- WHEN the user submits the form
- THEN the system rejects the submission with a group-validation error
- AND no Budget is created

### Requirement: Authorized Atomic Persistence

The system MUST authorize the requester before creation and MUST validate every submitted category on the server. Each referenced category MUST exist, belong to the requester, and match its group's compatible type. The system MUST create the Budget, groups, and items as one atomic operation; a validation or persistence failure MUST roll back all writes and return a failure result.

#### Scenario: Save a valid Budget and plan
- GIVEN an authenticated user submits valid metadata, groups, items, and compatible owned categories
- WHEN the save succeeds
- THEN one Budget with its selected color, groups, and items is persisted
- AND the result identifies the created Budget

#### Scenario: Reject unauthorized or incompatible categories
- GIVEN a submission references another user's, missing, or type-incompatible category
- WHEN the server validates the request
- THEN it rejects the request without persisting any Budget, group, or item
- AND it returns an authorization or validation failure without exposing protected data

#### Scenario: Roll back a failed multi-record save
- GIVEN the Budget insert has started
- WHEN any later group or item write fails
- THEN the transaction rolls back every write from that submission
- AND the user receives a recoverable save error

### Requirement: Budget Color Migration Safety

The system MUST persist a Budget color. Before applying the non-null color migration, the Drizzle snapshot and journal lineage MUST be reconciled to the approved migration target. The migration MUST backfill every legacy Budget with `94a3b8` before enforcing non-null color storage.

#### Scenario: Migrate legacy Budgets
- GIVEN legacy Budgets without a color and reconciled Drizzle lineage
- WHEN the approved migration is applied
- THEN each legacy Budget receives `94a3b8`
- AND the resulting color column contains no null legacy values

#### Scenario: Block unreconciled migration lineage
- GIVEN the required Drizzle metadata lineage is inconsistent
- WHEN migration application is attempted
- THEN the migration is not applied
- AND the inconsistency is reported for reconciliation

### Requirement: Non-Disruptive Recovery

The system MUST preserve Budget Details behavior and design while delivering this change. If creation fails, it MUST retain the user's in-progress client draft when feasible and MUST NOT require changes to Budget Details to recover.

#### Scenario: Recover from a save failure
- GIVEN a user has entered a valid draft
- WHEN the save returns a recoverable failure
- THEN the user remains able to correct and resubmit the draft
- AND Budget Details remains unchanged
