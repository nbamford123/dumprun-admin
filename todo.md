# Temporary ToDo File

## Admin site
- is that really the best way to do the menu renderer, with a separate class? Maybe better to just be a function
- define an error type for dumprun api errors
- firefox doesn't support datetime-local input type, probably ought to split the date and time out or find a webcomponent that does it. Or just blow off firefox?
- is there some way to leverage types in the new/edit views? Incoming type is always base type on edit, but we only send update type
- window title always shows "admin dashboard"
- right now userid and driverid on a pickup will be set to the admin who created/accepted them, but in production there should be a link in the pickups table to take you to that user
- should we add the ability to create/accept a pickup by admin on behalf of a user/driver? Will require api change.
- should admins be able to create/accept/etc. pickups for users and drivers rather than just their id? does it even make sense for an admin to create/accept a pickpup (except for testing purposes)
- maybe leave create/update errors on form, the notification is easy to miss
- surely the form components can have general similarities extracted out?
- ask ag-grid about the styling issues I encountererd using multiple grids from the npm package
- tests!!!
- failure to load grid shows no status just 'loading' state in grid
- ag-grid warnings in console
- some type of status message when update succeeds
- spinner on edit form when user is being loaded, spinner on create, spinner on delete. Spinners!
- should the user be loaded from the users screen? Not found on the edit screen seems weird
- look up burton's fouc fix
- perhaps we need a can't connect state for the health checks? Or is that defacto unhealthy?
- color on those statuses and icons! C'mon, man. Also latency, etc.
- get the openapi, types, schemas in an npm package? Or load directly from git?
- it looks like I could just copy out the icons I need-- they add about 8MB to the bundle
- maybe biome isn't a good fit for this front end? Doesn't format html or lit template literals, no linting for lit
