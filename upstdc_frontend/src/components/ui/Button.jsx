import React from 'react';

/**
 * Reusable button component with variants and sizes.
 * Variants: primary, secondary, ghost, danger, success
 * Sizes: sm, md, lg
 */
// PUBLIC_INTERFACE
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  as = 'button',
  ...props
}) {
  const Comp = as;

  const base =
    'btn-ui inline-flex items-center justify-center rounded transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  const variants = {
    primary:
      'bg-[var(--color-primary)] text-white hover:opacity-95 focus:ring-[var(--color-primary)]',
    secondary:
      'bg-[var(--color-secondary)] text-white hover:opacity-95 focus:ring-[var(--color-secondary)]',
    ghost:
      'bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[color:rgba(0,0,0,.05)]',
    danger:
      'bg-[var(--color-error)] text-white hover:opacity-95 focus:ring-[var(--color-error)]',
    success:
      'bg-[var(--color-success)] text-white hover:opacity-95 focus:ring-[var(--color-success)]'
  };
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-3.5 py-2',
    lg: 'text-base px-4.5 py-2.5'
  };

  const cls = [base, variants[variant] || variants.primary, sizes[size] || sizes.md, className]
    .filter(Boolean)
    .join(' ');

  return (
    <Comp className={cls} {...props}>
      {children}
    </Comp>
  );
}
