# Search for {{product}} using JSON data

## Tags
- regression

## App URL
local:test-pages/search.html

## Prompt
Search for {{product}} and verify the expected product appears.

## Workflow
- search-product

## Parameters
- product: "{{product}}"

## Expected
- text-visible: "{{expectedProduct}}"
- value: #search-input equals "{{product}}"
- count: #results li equals {{expectedCount}}

## Data File
data/product-search.json
