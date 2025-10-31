/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { ComponentPropsWithoutRef } from 'react';

interface ArticleProps extends ComponentPropsWithoutRef<'article'> {
  name: string;
  header: string;
}

const Article = ({ name, header, children, ...restProps }: ArticleProps) => {
  return (
    <article {...restProps}>
      <header>
        <h2 className={`h2 ${name}-title`}>{header}</h2>
      </header>
      {children}
    </article>
  );
};

export default Article;
