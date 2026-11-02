# Product search finds a matching item

## Tags
- smoke
- regression

## App URL
local:test-pages/search.html

## Prompt
Search for laptop and confirm the matching product appears.

## Workflow
- search-product

## Parameters
- product: "laptop"

## Expected
- text-visible: "Laptop"
- value: #search-input equals "laptop"
- count: #results li equals 1
- enabled: #search-input
