# API

Based on REST API.

## GET: Read, List, DELETE: Delete

No request body is allowed.
Read, List, and Delete parameters are accepted via query/search parameters:

```
GET /api/item?id=1
GET /api/items?limit=10&offset=5
```

## POST: Create, PATCH: Update, PUT: Upsert

Allowed body: JSON String, URL Encoded Form Data, or Multipart Form Data.
The provided body is passed in the `input` parameter, along with query/search parameters and `files` if applicable.

## Responses

API always response with JSON.

## Errors

If the response was successful, the returned status code will reflect that (200 or 201).
In case of user input errors API will respond with the following structure:

```json
{
  "errors": [
    {
      "name": "title",
      "message": "Title is required"
    }
  ],
  "code": 400
}
```

Note: Response status code will be also set the same code
