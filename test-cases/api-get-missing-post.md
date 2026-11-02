# Get missing sample post

## Tags
- regression
- api

## API URL
https://jsonplaceholder.typicode.com/posts/999

## Method
GET

## Prompt
Request a missing post and confirm the API returns a not found response.

## Mock Response
Status: 404
```json
{
  "message": "Post not found"
}
```

## Expected
- status: 404
- json.message equals: "Post not found"
