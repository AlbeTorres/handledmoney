---
name: user-story-formatter
description: >
  Formats user stories into a standardized Markdown structure with sections for
  Main History, Business Rules, Technical Restrictions, Acceptance Criteria,
  Dependencies, and Additional Notes. Use this skill whenever the user provides
  a user story, functional requirement, or feature description and wants it
  formatted, documented, or saved as a structured Markdown file. Trigger when
  the user mentions "historia de usuario", "user story", "requisito funcional",
  "RF-", acceptance criteria, or asks to document a feature/requirement.
  Also trigger when user pastes raw story text and wants it formatted or saved.
---

# User Story Formatter

Converts raw user stories or functional requirements into a standardized Markdown file.

## Workflow

### Step 1 — Ask for the output folder

Before doing anything else, ask the user:

> "¿En qué carpeta quieres guardar el archivo? (por ejemplo: `./docs/requirements` o `/home/user/project/stories`)"

Wait for their response before proceeding.

### Step 2 — Parse the user story

Extract the following fields from the user's input (ask if any are missing or ambiguous):

| Field | Description |
|---|---|
| **RF code + name** | e.g. `RF-1.1 User Registration` → used as the filename |
| **Main story** | The "As a... I want... so that..." sentence |
| **Business Rules** | Numbered list of business constraints |
| **Technical Restrictions** | Numbered list of technical constraints |
| **Acceptance Criteria** | Gherkin-style Given/When/Then scenarios |
| **Dependencies** | Other stories or systems this depends on (default: "None") |
| **Additional Notes** | Notes, mockup references, libraries, etc. |

### Step 3 — Generate the Markdown file

Use this **exact template** — preserve all heading levels, blockquote syntax, and checkbox formatting:

```markdown
# {Main Story Title}

As {actor}, I want {goal} so that {benefit}.


> Business Rules:
> 
>  1. {rule_1}
>  
>  2. {rule_2}
>  
>  {... more rules}

#### Technical Restrictions:
```
1. {restriction_1}
    
2. {restriction_2}
    
{... more restrictions}
```

### Acceptance Criteria

 - [ ] Given that {context_1}, when {action_1}, then {outcome_1}.
    
- [ ]  Given that {context_2}, when {action_2}, then {outcome_2}.
    
{... more criteria}


#### Dependencies

1. {dependency or "None"}
    

#### Additional Notes

1. **Notes or Mockups**: {notes}
```

### Step 4 — Save the file

- **Filename**: derived from the RF code and name, slugified.
  - `RF-1.1 User Registration` → `RF-1.1_User_Registration.md`
  - Replace spaces with `_`, keep alphanumeric characters, dots, and hyphens.
- **Path**: use the folder the user provided in Step 1.
- Create intermediate directories if they don't exist (`mkdir -p`).
- After saving, confirm with the full path of the created file.

### Step 5 — Present the file

Use the `present_files` tool to share the generated file with the user.

---

## Formatting Rules

- **Business Rules** use blockquote syntax (`> `) with a blank `> ` line between each rule.
- **Technical Restrictions** are wrapped in a fenced code block (triple backticks) inside the `#### Technical Restrictions:` section.
- **Acceptance Criteria** use GitHub-flavored Markdown task list syntax (`- [ ]`).
- **Dependencies and Additional Notes** use numbered lists.
- Preserve blank lines between checklist items for readability.

---

## Example

**Input:**
```
RF-2.3 Password Reset
Historia: Como usuario registrado, quiero poder restablecer mi contraseña mediante
email para poder recuperar el acceso a mi cuenta.

Reglas de negocio:
- El enlace de restablecimiento expira en 15 minutos.
- Solo se puede solicitar un restablecimiento cada 5 minutos.

Restricciones técnicas:
- Token generado con crypto.randomBytes.
- Almacenado en Redis con TTL.

Criterios de aceptación:
- Dado que soy usuario registrado, cuando solicito restablecer contraseña con email válido,
  entonces recibo un email con enlace de restablecimiento.
- Dado que el enlace ha expirado, cuando intento usarlo, entonces el sistema muestra error.

Dependencias: RF-1.1 User Registration
Notas: Usar nodemailer para el envío de emails.
```

**Output file:** `RF-2.3_Password_Reset.md` saved in the user-specified folder.
