# Basic CRUD project with NodeJS

> This project will be used to get changes and generate documentation about it.


## Project Structure
```
project/
├── package.json
├── app/
    ├── server.js
    ├── db.js
    └── routes/
       ├── users.js
       └── articles.js
```

## How to test

1. Create user

```
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Felipe","email":"felipe@example.com"}'
```

2. Create article

```
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{"title":"Meu primeiro post","content":"Conteúdo de teste","user_id":1}'
```


3. List article

```
curl http://localhost:3000/api/articles
```