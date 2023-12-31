# delete-cache-by-key
[![Create release](https://github.com/DareFox/delete-cache-by-key/actions/workflows/create-release.yml/badge.svg)](https://github.com/DareFox/delete-cache-by-key/actions/workflows/create-release.yml)

This GitHub Action deletes a GitHub Action cache with the provided key.

## Example
```yml
on:
  push:
name: Delete cache that starts with 'build-cache-'
permissions:
  actions: write ## Important, action can't delete cache without permission
jobs:
  delete-cache:
    runs-on: ubuntu-latest
    name: Delete cache
    steps:
      - name: Delete 'build-cache-' cache
        uses: DareFox/delete-cache-by-key@v1
        with:
          key: build-cache- 
          attempts: 3
          mode: startsWith
```

## Inputs

### `key`
**Required.** Key of the cache.

### `mode`
**Required.** Mode of searching cache.

Valid values:

###### `exact`
Finds cache with the exact same key. For example:

If the key is `mycachekey` and there are caches named `mycachekey` and `mycachekey-somethingsomething`, in exact mode, the action will delete `mycachekey` but not `mycachekey-somethingsomething`.

###### `startsWith`
Finds cache that starts with this key. For example:

If the key is `mycachekey` and there are caches named `mycachekey` and `mycachekey-somethingsomething`, in startsWith mode, the action will delete both `mycachekey` and `mycachekey-somethingsomething` because they share an identical prefix.

### `attempts`
How many tries should the action take before throwing an error.

Default: 1

### `delay`
Delay in ms between trying again.

Default: 2000

### `token`
`GITHUB_TOKEN` to use for this action.

Default: auto-generated `GITHUB_TOKEN` for the workflow.
