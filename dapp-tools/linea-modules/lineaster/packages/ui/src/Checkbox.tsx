import clsx from 'clsx';
import type { ComponentProps } from 'react';
import { forwardRef, useId } from 'react';

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'prefix'> {
  label?: string;
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function CheckBox(
  { label, className = '', ...props },
  ref
) {
  const id = useId();

  return (
    <div className="flex items-center">
      <input
        ref={ref}
        className={clsx(
          'checked:border-brand-500 checked:bg-brand-500 float-left mr-2 h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 bg-white bg-contain bg-center bg-no-repeat align-top transition duration-200 focus:outline-none',
          className
        )}
        type="checkbox"
        id={id}
        {...props}
      />
      <label className="inline-block whitespace-nowrap text-sm" htmlFor={id}>
        {label}
      </label>
    </div>
  );
});
