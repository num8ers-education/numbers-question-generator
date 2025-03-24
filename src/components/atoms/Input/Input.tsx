import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      leftIcon,
      rightIcon,
      containerClassName,
      labelClassName,
      errorClassName,
      type = 'text',
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx('space-y-2', containerClassName)}>
        {label && (
          <label
            className={clsx(
              'text-sm font-medium leading-none text-neutral-700',
              error && 'text-danger-500',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={clsx(
              'flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-danger-500 focus:ring-danger-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className={clsx('text-sm text-danger-500', errorClassName)}>{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

function cn(...inputs: any) {
  return clsx(inputs);
}
