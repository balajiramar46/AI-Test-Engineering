# Search for {{product}}

## Tags
- regression

## App URL
local:test-pages/search.html

## Prompt
Search for {{product}} and confirm the matching product is displayed.

## Workflow
- search-product

## Parameters
- product: "{{product}}"

## Expected
- text-visible: "{{expectedProduct}}"
- value: #search-input equals "{{product}}"
- count: #results li equals {{expectedCount}}

## Examples
| product | expectedProduct | expectedCount |
| --- | --- | --- |
| laptop | Laptop | 1 |
| phone | Phone | 2 |
| headphones | Headphones | 1 |
