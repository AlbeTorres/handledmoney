---
name: trello
description: Manage Trello boards, lists, and cards via the Trello REST API.
homepage: https://developer.atlassian.com/cloud/trello/rest/
metadata:
  {
    'otto':
      { 'emoji': '📋', 'requires': { 'bins': ['jq'], 'env': ['TRELLO_API_KEY', 'TRELLO_TOKEN'] } },
  }
---

# Trello Skill

Manage Trello boards, lists, and cards directly from Otto.

## Setup

1. Get your API key: https://trello.com/app-key
2. Generate a token (click "Token" link on that page)
3. Set environment variables:
   ```bash
   export TRELLO_API_KEY="your-api-key"
   export TRELLO_TOKEN="your-token"
   ```

## Usage

Search for the Api Key and Token in the .env file of this project

All commands use curl to hit the Trello REST API.

### List boards

```bash
curl -s "https://api.trello.com/1/members/me/boards?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" | jq '.[] | {name, id}'
```

### List lists in a board

```bash
curl -s "https://api.trello.com/1/boards/{boardId}/lists?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" | jq '.[] | {name, id}'
```

### List cards in a list

```bash
curl -s "https://api.trello.com/1/lists/{listId}/cards?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" | jq '.[] | {name, id, desc}'
```

### Create a card

```bash
curl -s -X POST "https://api.trello.com/1/cards?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" \
  -d "idList={listId}" \
  -d "name=Card Title" \
  -d "desc=Card description"
```

### Move a card to another list

```bash
curl -s -X PUT "https://api.trello.com/1/cards/{cardId}?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" \
  -d "idList={newListId}"
```

### Add a comment to a card

```bash
curl -s -X POST "https://api.trello.com/1/cards/{cardId}/actions/comments?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" \
  -d "text=Your comment here"
```

### Archive a card

```bash
curl -s -X PUT "https://api.trello.com/1/cards/{cardId}?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" \
  -d "closed=true"
```

### Create Checklist on a Card

curl -s -X POST "https://api.trello.com/1/cards/{cardId}/checklists?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" \
 -d "name=Acceptance Criteria"

### Add CheckItem to Checklist

curl -s -X POST "https://api.trello.com/1/checklists/{checklistId}/checkItems?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" \
 -d "name={itemText}"

### Get Checklists on a Card

curl -s -X GET "https://api.trello.com/1/cards/{cardId}/checklists?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN"

### Update a CheckItem

curl -s -X PUT "https://api.trello.com/1/cards/{cardId}/checkItem/{idCheckItem}?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" \
 -d "state={complete/incomplete}"

## Reusable Project Data

Each project can store reusable data (board IDs, list IDs, etc.) in `.agents/project-data.json`. 

**Before starting work on a new project, always check if this file exists and read it to get project-specific IDs:**

```bash
# Read project data file
cat .agents/project-data.json
```

If the file doesn't exist, you can create it with the structure:

```json
{
  "trello": {
    "boards": {
      "BoardName": {
        "id": "board-id-here",
        "lists": {
          "ListName": "list-id-here"
        }
      }
    }
  }
}
```

## Notes

- Board/List/Card IDs can be found in the Trello URL or via the list commands
- The API key and token provide full access to your Trello account - keep them secret!
- Rate limits: 300 requests per 10 seconds per API key; 100 requests per 10 seconds per token; `/1/members` endpoints are limited to 100 requests per 900 seconds

## Examples

```bash
# Get all boards
curl -s "https://api.trello.com/1/members/me/boards?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN&fields=name,id" | jq

# Find a specific board by name
curl -s "https://api.trello.com/1/members/me/boards?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" | jq '.[] | select(.name | contains("Work"))'

# Get all cards on a board
curl -s "https://api.trello.com/1/boards/{boardId}/cards?key=$TRELLO_API_KEY&token=$TRELLO_TOKEN" | jq '.[] | {name, list: .idList}'
```
