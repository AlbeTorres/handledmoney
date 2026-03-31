---
name: developer-trello-tasks
description: Manage and track developer tasks in Trello using the "User History" template.
homepage: https://developer.atlassian.com/cloud/trello/rest/
metadata: { 'otto': { 'emoji': '📋' } }
---

# Developer Tasks Skill

Manage and track developer tasks in Trello using the "User History" template.

## Workflow

1. **Find the target list:** Check `.agents/project-data.json` for the project board and list IDs (e.g., Backlog, Inbox, TO-DO)
2. **Create card:** Add a new card with the template structure
3. **Format:** ALWAYS write card names and descriptions in ENGLISH

## Card Template

Use this structure for the card description:

```
## Main History
As a [user type], I want [goal], so that [benefit].

## Business Rules
- [business rule]

## Technical Restrictions
- [technical restriction]

## Dependencies
- [dependency]

## Additional Notes
- Dependencies: RF-XXX or None

{Acceptance Criteria: as a Item Checklist in Trello card}
- [acceptance criteria]

```

## Available Commands

### Create a Task

`create_task --name "Task Name" --description "Content"`

### Sync

`sync_tasks` - Synchronizes local workspace task list with Trello.

## Notes

- Before creating cards, always check `.agents/project-data.json` for project-specific IDs
- If the file doesn't exist, ask the user for board/list IDs to create it
- Keep card descriptions concise - detailed specs can be linked or attached
- ALWAYS write card names and descriptions in ENGLISH no matter the language of the user

## Examples

### Main History

As an unregistered user, I want to register using an email and password so that I can access the application's features.

### Business Rules:

The password must not be stored in plain text.

The password must be hashed using a secure algorithm (bcrypt/argon2).

Access must not be allowed without email verification.

### Technical Restrictions:

Validation with Zod.

Persistence in PostgreSQL.

Backend rate limiting.

### Dependencies

None

### Additional Notes

Notes or Mockups: Use Better Auth for handling authentication; registration form mockup.

Acceptance Criteria:

- [ ] Given that I am on the registration page, when I enter a unique and valid email (according to RFC 5322) and a password with at least 8 characters (including uppercase letters, lowercase letters, numbers, and symbols), then the system creates the account and automatically sends a verification email.
- [ ] Given that I enter a duplicate or invalid email, when I attempt to register, then the system displays a specific error message.
- [ ] Given that I attempt to register more than 3 times per hour from the same IP address, when I submit the form, then the system applies rate limiting and temporarily blocks the request.
