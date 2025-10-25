# shadcn/ui Migration Quick Reference

**For Story 1.1 - Token Compliance**

---

## 🚀 Quick Fix Guide

### Component: `input.tsx`

**Line 11-12 Changes:**

```tsx
// ❌ BEFORE
<input
  className={cn(
    "transition-[color,box-shadow] ring-[3px]",
    className
  )}
/>

// ✅ AFTER
<input
  className={cn(
    "transition-interactive ring-focus",
    className
  )}
/>
```

---

### Component: `card.tsx`

**Line 23 Changes (CardHeader grid):**

```tsx
// ❌ BEFORE
<div
  className={cn(
    "grid grid-rows-[auto_auto] has-data-[slot=card-action]:grid-cols-[1fr_auto]",
    className
  )}
/>

// ✅ AFTER - Option 1 (Tailwind utilities)
<div
  className={cn(
    "grid grid-rows-card-header",
    "data-[slot=card-action]:grid-cols-card-header-action",
    className
  )}
/>

// ✅ AFTER - Option 2 (Inline style for conditional)
<div
  className={cn("grid grid-rows-card-header", className)}
  style={
    hasCardAction ? { gridTemplateColumns: 'var(--grid-cols-card-header-action)' } : undefined
  }
/>
```

**Line 78 Changes (Conditional padding):**

```tsx
// ❌ BEFORE
<div className="[.border-b]:pb-6">
  ...
</div>

// ✅ AFTER (Add semantic class name)
<div className="card-header">
  {/* Utility class in globals.css handles .border-b .card-header { pb-6 } */}
  ...
</div>
```

**Line 23 - Full CardHeader Example:**

```tsx
// ❌ BEFORE
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-rows-[auto_auto] [.border-b]:pb-6",
      "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
      className
    )}
    {...props}
  />
))

// ✅ AFTER
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-rows-card-header card-header",
      "data-[slot=card-action]:grid-cols-card-header-action",
      className
    )}
    {...props}
  />
))
```

---

### Component: `scroll-area.tsx`

**Line 21 Changes:**

```tsx
// ❌ BEFORE
<div
  className={cn(
    "rounded-[inherit] transition-[color,box-shadow]",
    className
  )}
/>

// ✅ AFTER
<div
  className={cn(
    "rounded-inherit transition-interactive",
    className
  )}
/>
```

---

### Component: `separator.tsx`

**Line 20 Changes:**

```tsx
// ❌ BEFORE (Horizontal)
<div className="h-px w-full" />

// ✅ AFTER (Horizontal)
<div className="h-separator w-full" />

// ❌ BEFORE (Vertical)
<div className="w-px h-full" />

// ✅ AFTER (Vertical)
<div className="w-separator h-full" />
```

---

## 📋 Find & Replace Patterns

Use these patterns in your editor for bulk replacement:

| Find | Replace |
|------|---------|
| `ring-[3px]` | `ring-focus` |
| `transition-[color,box-shadow]` | `transition-interactive` |
| `rounded-[inherit]` | `rounded-inherit` |
| `grid-rows-[auto_auto]` | `grid-rows-card-header` |
| `has-data-[slot=card-action]:grid-cols-[1fr_auto]` | `data-[slot=card-action]:grid-cols-card-header-action` |
| `h-px` | `h-separator` |
| `w-px` | `w-separator` |
| `[.border-b]:pb-6` | (Remove, add `card-header` class) |
| `[.border-t]:pt-6` | (Remove, add `card-footer` class) |

---

## ✅ Verification Steps

1. **Run linter:**
   ```bash
   bun run lint
   ```

2. **Check for remaining arbitrary values:**
   ```bash
   grep -r "\[.*\]" orchestratai_client/src/components/ui/
   ```

3. **Verify Tailwind utilities are generated:**
   - Start dev server: `bun run dev`
   - Inspect elements in browser DevTools
   - Confirm CSS variables resolve correctly

4. **Visual regression check:**
   - Inputs should have 3px focus rings (cyan)
   - Card headers should maintain grid layout
   - Separators should be 1px lines
   - ScrollArea should inherit parent radius

---

## 🎯 Component Checklist

- [ ] `input.tsx` - Updated `ring-[3px]` and `transition-[color,box-shadow]`
- [ ] `card.tsx` - Updated grid templates and conditional padding
- [ ] `scroll-area.tsx` - Updated `rounded-[inherit]` and transitions
- [ ] `separator.tsx` - Updated `h-px` and `w-px`
- [ ] `button.tsx` - ✅ No changes needed
- [ ] `badge.tsx` - ✅ No changes needed
- [ ] `collapsible.tsx` - ✅ No changes needed

---

## 🚨 Common Issues

### Issue: `grid-cols-card-header-action` not working with `has-data-[slot]`

**Cause:** Tailwind's `has-*` variant may not support custom utilities.

**Solution:** Use inline styles or create explicit utility class:

```tsx
<div
  className="grid grid-rows-card-header"
  data-slot={hasAction ? "card-action" : undefined}
  style={hasAction ? { gridTemplateColumns: 'var(--grid-cols-card-header-action)' } : undefined}
/>
```

### Issue: `.card-header` padding not applying

**Cause:** Utility class requires parent `.border-b` class.

**Solution:** Ensure parent wrapper has `.border-b`:

```tsx
<Card className="border-b">
  <CardHeader className="card-header">
    {/* Now gets pb-6 */}
  </CardHeader>
</Card>
```

### Issue: Tailwind not generating custom utilities

**Cause:** `globals.css` not imported or `@theme` tokens not recognized.

**Solution:**
1. Verify `import './globals.css'` in `app/layout.tsx`
2. Restart dev server: `bun run dev`
3. Check Tailwind v4 configuration

---

## 📞 Need Help?

If linting errors persist:

1. Check token definitions in `globals.css:230-246`
2. Verify `layout.css` import in `globals.css:28`
3. Review [shadcn-ui-token-mappings.md](./shadcn-ui-token-mappings.md) for complete reference
4. Contact Sally (UX Expert) for token system questions

---

**Last Updated:** October 24, 2025
**Status:** Ready for Implementation
