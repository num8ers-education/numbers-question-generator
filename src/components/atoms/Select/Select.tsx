import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      containerClassName,
      labelClassName,
      errorClassName,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx('space-y-2', containerClassName)}>
        {label && (
          <label
            className={clsx(
              'block text-sm font-medium leading-none text-neutral-700',
              error && 'text-danger-500',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            className={clsx(
              'flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
              error && 'border-danger-500 focus:ring-danger-500',
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-neutral-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className={clsx('text-sm text-danger-500', errorClassName)}>{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };

function cn(...inputs: any) {
  return clsx(inputs);
}
