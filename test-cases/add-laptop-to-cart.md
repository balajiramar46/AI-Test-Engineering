# Add a searched laptop to the cart

## Tags
- smoke
- regression

## App URL
local:test-pages/search.html

## Prompt
Search for a laptop, open it, and add it to the cart.

## Workflow
- search-product

## Parameters
- product: "laptop"

## Actions
- call ProductSearchPage.openProduct with "Laptop"
- call ProductSearchPage.addToCart

## Expected
- text-visible: "Laptop added to cart"
