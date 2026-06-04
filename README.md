# AMDX

AMDX lazily renders agent-written `.mdx` files from:

```txt
~/.openclaw/media/mdx
```

Routes map directly to files:

```txt
/weekly/report -> ~/.openclaw/media/mdx/weekly/report.mdx
```

The root route lists available `.mdx` files. Individual documents are compiled
and rendered on request.
