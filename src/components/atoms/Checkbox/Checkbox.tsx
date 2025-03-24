import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      containerClassName,
      labelClassName,
      errorClassName,
      ...props
    },
    ref
  ) => {
    return ( 
      <div className={cn('flex items-start', containerClassName)}>
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            className={cn(
              'h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded',
              error ? 'border-danger-500 focus:ring-danger-500' : '',
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label
              className={cn(
                'font-medium text-neutral-700',
                error ? 'text-danger-500' : '',
                labelClassName
              )}
            >
              {label}
            </label>
          </div>
        )}
        {error ? (
          <p className={cn('text-sm text-danger-500 mt-1', errorClassName)}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };

function cn(...inputs: any) {
  return twMerge(clsx(inputs));
}
