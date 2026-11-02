# Get a post from the configured API

## Tags
- api
- live

## API URL
env:API_BASE_URL/posts/1

## Mode
real

## Method
GET

## Headers
Accept: application/json
Authorization: Bearer ${API_TOKEN}

## Prompt
Read a post from the real test API and validate its response contract.

## Expected
- status: 200
- json.id equals: 1
