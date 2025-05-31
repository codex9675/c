import { createClient } from '@libsql/client'

const client = createClient({
  url: 'libsql://productmanagement-codex.aws-ap-south-1.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicm8iLCJpYXQiOjE3NDc3NjQ5MDgsImlkIjoiMWRjYmQ2ZDMtMjkyYy00Yjk3LThmODQtYTU2OTUyYjc3MTkyIiwicmlkIjoiNmM5ZmZjYzktMmJiMS00MDhkLWFmZTktZDBlMGFkMmVjMmNkIn0.wTKjfC7FCJLDAH4QgONxLsav3pCAbJtWApd13yFJgwWw4w0iLc6T96ObYFXXhvXaYz6Ctxe-PTfJb9baz-3KCw"',
})

export default client
