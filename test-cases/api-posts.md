# Get a sample post

## Tags
- api
- sanity

## API URL
https://jsonplaceholder.typicode.com/posts/1

## Method
GET

## Mode
real
## Prompt
Retrieve post 1 and verify the response.
## Expected
- status: 200
- json.userId equals: 1
- json.id equals: 1
- json.title contains: "sunt"