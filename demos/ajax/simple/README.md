# Simple AJAX example

This example shows an AJAX request to a local file.  Browsers don't allow you to do requests to `file://` URLs (for security reasons), so you need to create a local server to run this one.

```bash
cd <this directory>
python -m SimpleHTTPServer
open http://localhost:8000
```
