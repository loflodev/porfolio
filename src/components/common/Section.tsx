/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { ComponentPropsWithoutRef } from 'react';

interface SectionProps extends ComponentPropsWithoutRef<'section'> {
  name?: string;
  title?: string;
}

const Section = ({ title, name, children, ...restProps }: SectionProps) => {
  return (
    <section {...restProps}>
      {title && <h3 className={`h3 ${name}-title`}>{title}</h3>}
      {children}
    </section>
  );
};

export default Section;
