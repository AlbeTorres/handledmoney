# Budget Plan Category Selection Specification

## Purpose

Define compatible category selection and constrained quick category creation within a Budget plan.

## Requirements

### Requirement: Compatible Category Selection

The system MUST present only existing categories that belong to the requester and are compatible with the selected plan group's calculation type. It MUST allow the user to select an eligible category for an item and MUST reject a category that is not owned by the requester or is incompatible when submitted outside the selector.

#### Scenario: Select a compatible category
- GIVEN a plan item in a group with a compatible category type
- WHEN the user opens its selector
- THEN only the user's existing compatible categories are offered
- AND choosing one assigns it to that item

#### Scenario: Handle no compatible categories
- GIVEN a group has no existing compatible categories owned by the user
- WHEN the user opens its selector
- THEN the selector communicates the empty state
- AND the user can start quick category creation

### Requirement: Quick Category Creation and Selection

The system MUST provide a quick-creation drawer from the compatible selector. The drawer MUST collect a category name, fixed compatible type, color, and icon; it MUST create the category through the normal authorized validation path and MUST automatically select the returned category for the originating item.

#### Scenario: Create and select a compatible category
- GIVEN the user opens quick creation from a plan item
- WHEN the user submits valid name, color, and icon
- THEN a category of the originating group's compatible type is created
- AND that returned category is selected for the originating item

#### Scenario: Reject an invalid quick category
- GIVEN the quick-creation drawer is open
- WHEN required data is invalid or category creation fails
- THEN the drawer reports the failure and does not select a category
- AND the originating plan item remains unchanged
