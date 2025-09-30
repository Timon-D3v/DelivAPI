# DelivAPI

A personal CDN/WebAPI for uploading and pulling images and other files from.


## Env Variables

ENV = <"dev" | "prod">
PORT = &lt;number>
HOST = &lt;string> # e.g. "localhost"

SESSION_SECRET = &lt;string>

MYSQL_HOST = &lt;string>
MYSQL_USER = &lt;string> # e.g. "user"
MYSQL_PASSWORD = &lt;string> # e.g. "password123"
MYSQL_SCHEMA = "cdn"
MYSQL_PORT = &lt;number> # e.g. 3306

MAILJET_PUBLIC_KEY = &lt;your-mailjet-key>
MAILJET_PRIVATE_KEY = &lt;your-mailjet-key>

ORIGIN = &lt;string> # e.g. "http://localhost:8000"