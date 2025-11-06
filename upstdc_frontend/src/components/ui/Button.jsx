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

  // Base uses CSS variables and native hover/active transitions; relies on global :focus-visible
  const base = 'btn-ui';
  const variants = {
    primary: 'btn btn--primary',
    secondary: 'btn btn--secondary',
    ghost: 'btn btn--ghost',
    danger: 'btn btn--danger',
    success: 'btn btn--success',
  };
  const sizes = {
    sm: 'btn--sm',
    md: 'btn--md',
    lg: 'btn--lg',
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
