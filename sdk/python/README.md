# py_scilog

Python client for SciLog.

## High-level interface

The high-level interface centers around the `SciLog` class, which provides:

- Authentication and HTTP access to a SciLog instance
- Logbook selection that automatically scopes most operations
- Convenience helpers for common tasks (compose messages, upload files, query snippets)

### Quick start

```python
from scilog import SciLog

log = SciLog("https://your-scilog.example/api/v1")
logbooks = log.get_logbooks(ownerGroup="p12345")
log.select_logbook(logbooks[0])

log.new().add_text("Hello from Python!").send()

```

### Authentication

By default, the client prompts for credentials the first time it needs a token
and stores it locally per user. You can also provide credentials or a token
explicitly via the constructor:

```python
log = SciLog(
	"https://your-scilog.example/api/v1",
	options={
		"username": "alice",
		"password": "secret",
		"token": "Bearer <token>",
		"login_path": "https://your-scilog.example/api/v1/users/login",
	},
)
```

### Selecting a logbook

Many operations are pinned to the currently selected logbook. After selection,
the logbook ID is injected into requests automatically.

```python
logbooks = log.get_logbooks(ownerGroup="p12345")
log.select_logbook(logbooks[0])
```

### Sending messages

Messages can be composed with the `LogbookMessage` builder, which provides a fluent API for constructing content. Once ready, the message can be sent to the currently selected logbook.

```python
# Compose a new message with HTML content and send it to the currently selected logbook
log.new().add_text("<p>Run started</p>").send()

# Alternatively, create a message and send it later
msg = log.new().add_text("<p>Run completed</p>")
# ... do other things ...
msg.send()
```

The `LogbookMessage` builder provides convenient access to the most common tasks, such as 

* Adding text content with `add_text()`
* Attaching files with `add_file()`
* Adding tags with `add_tag()`
* Sending the message with `send()`

The builder also respects the order of operations, so you can build up the message in a natural way. For example, you can add text, then attach a file, then add more text, and the final message will reflect that order.

```python
msg = log.new()
msg.add_text("<p>Scan number 20</p>")
msg.add_file("/path/to/log.txt")
msg.add_text("<p>Sample name: Test Sample</p>")
msg.send()
```

### Snippets and queries

You can query snippets with a filter or by passing keyword conditions that are
converted into a `where` clause. This call returns snippet models such as
`Paragraph`, `Location`, or `Filesnippet` depending on the response.

```python
# Get all paragraphs in the currently selected logbook
snippets = log.get_snippets(snippetType="paragraph")
```