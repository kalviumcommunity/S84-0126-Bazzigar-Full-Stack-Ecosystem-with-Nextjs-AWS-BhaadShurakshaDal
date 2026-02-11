# Fix for Next.js Lockfile Error

## Error Description

```
⚠ Found lockfile missing swc dependencies, patching...
✓ Ready in 2.6s
⨯ Failed to patch lockfile, please try uninstalling and reinstalling next in this workspace
TypeError: Cannot read properties of undefined (reading 'os')
```

## Root Cause

This error occurs when Next.js tries to patch the `package-lock.json` file but encounters missing or corrupted SWC (Speedy Web Compiler) dependencies. This is a known issue with Next.js 14.x on Windows systems.

## Solution

### Option 1: Quick Fix (Recommended)

1. **Stop the development server** (Press `Ctrl+C` in the terminal)

2. **Clean the cache:**

```bash
cd frontend
npm run clean
```

3. **Reinstall dependencies:**

```bash
npm install
```

4. **Start the dev server:**

```bash
npm run dev
```

### Option 2: Manual Fix

1. **Stop the development server**

2. **Delete problematic files:**

```bash
cd frontend
Remove-Item .next -Recurse -Force
Remove-Item node_modules\.cache -Recurse -Force
Remove-Item package-lock.json -Force
```

3. **Reinstall:**

```bash
npm install
```

4. **Generate Prisma Client:**

```bash
npx prisma generate
```

5. **Start dev server:**

```bash
npm run dev
```

### Option 3: Complete Reset (If above doesn't work)

1. **Stop ALL Node processes:**
   - Close VS Code
   - Open Task Manager (Ctrl+Shift+Esc)
   - End all `node.exe` processes

2. **Delete node_modules:**

```bash
cd frontend
# Wait a few seconds, then:
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
Remove-Item .next -Recurse -Force
```

3. **Clear npm cache:**

```bash
npm cache clean --force
```

4. **Reinstall:**

```bash
npm install
```

5. **Start dev server:**

```bash
npm run dev
```

## Prevention

### 1. Use .npmrc Configuration

The `.npmrc` file has been added to the frontend directory with these settings:

```
legacy-peer-deps=true
strict-peer-dependencies=false
auto-install-peers=true
```

This helps prevent dependency conflicts.

### 2. Use npm Scripts

New scripts have been added to `package.json`:

```bash
# Clean build artifacts and cache
npm run clean

# Clean and reinstall everything
npm run reinstall
```

### 3. Keep Dependencies Updated

Regularly update Next.js and other dependencies:

```bash
npm update
npm audit fix
```

## Why This Happens

1. **SWC Binary Issues**: Next.js uses SWC (written in Rust) for fast compilation. The Windows binary sometimes gets corrupted or locked by other processes.

2. **Lockfile Inconsistencies**: When `package-lock.json` doesn't match the actual installed packages, Next.js tries to patch it automatically but can fail.

3. **File Locking**: On Windows, running dev servers can lock `.node` files, preventing deletion or updates.

## Troubleshooting

### Error persists after reinstall?

**Check for running processes:**

```bash
# PowerShell
Get-Process node | Stop-Process -Force
```

### Port 3000 already in use?

The dev server will automatically try port 3001, 3002, etc. Or manually specify:

```bash
PORT=3002 npm run dev
```

### Still getting errors?

1. **Restart your computer** (clears all file locks)
2. **Update Node.js** to the latest LTS version
3. **Check antivirus** - sometimes it blocks file operations
4. **Run as Administrator** (right-click PowerShell → Run as Administrator)

## Additional Notes

### For Team Members

If you encounter this error:

1. Don't commit `package-lock.json` changes unless intentional
2. Always stop the dev server before installing new packages
3. Use `npm ci` instead of `npm install` in CI/CD pipelines

### For Production

This error only affects development. Production builds are not affected because:

- `next build` doesn't use the dev server
- Docker builds use clean environments
- CI/CD pipelines use `npm ci` which doesn't patch lockfiles

## Related Issues

- [Next.js Issue #52323](https://github.com/vercel/next.js/issues/52323)
- [Next.js Issue #48748](https://github.com/vercel/next.js/issues/48748)

## Success Indicators

After applying the fix, you should see:

```bash
▲ Next.js 14.2.35
- Local:        http://localhost:3000
✓ Starting...
✓ Ready in 2.6s
```

Without any warnings about lockfile patching.
