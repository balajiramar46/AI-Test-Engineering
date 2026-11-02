# Get sample post

## Tags
- smoke
- api

## API URL
https://jsonplaceholder.typicode.com/posts/1

## Method
GET

## Prompt
Get post 1 and verify its response status and important fields.

## Mock Response
Status: 200
```json
{
  "userId": 1,
  "id": 1,
  "title": "A sample post returned by our mock API",
  "body": "This deterministic response is intercepted locally; no public API is called."
}
```

## Expected
- status: 200
- json.id equals: 1
- json.title contains: "sample post"
