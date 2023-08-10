# common-page-header

Node: `.common-page-header`

Can contain next elements:

- `title`
- `tools`

`tools` can contain nested elements:

- `tools-icon`
- `tools-button`

Hese icons and buttons support few items' themes:

- `theme-primary`
- `theme-success`
- `theme-warn`
- `theme-error` (the same as `theme-danger`)

Example of different icons & buttons themes:

```html
<a class="tools-icon"><i class="fa-solid fa-copy"></i></a>
<a class="tools-icon theme-primary"><i class="fa-solid fa-copy"></i></a>
<a class="tools-icon theme-success"><i class="fa-solid fa-check"></i></a>
<a class="tools-icon theme-warn"><i class="fa-solid fa-bell"></i></a>
<a class="tools-icon theme-error"><i class="fa-solid fa-warning"></i></a>
<a class="tools-icon theme-danger"><i class="fa-solid fa-warning"></i></a>
<a class="tools-icon disabled"><i class="fa-solid fa-copy"></i></a>
<a class="tools-button theme-primary">Waitlisted</a>
<a class="tools-button theme-primary">No match needed</a>
<a class="tools-button theme-primary">Mark all matched</a>
<a class="tools-button theme-primary">Match</a>
<a class="tools-button disabled">No match needed</a>
<a class="tools-button theme-danger">Delete proxy</a>
```
