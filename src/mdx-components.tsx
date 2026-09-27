import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import { Callout, IslandFigure, RuleTable, Sprites, Swatches } from '@/features/chapters/mdx/components';

const components: MDXComponents = {
  a: ({ href = '', children, ...rest }) =>
    href.startsWith('/') ? (
      <Link href={href} className="link" {...rest}>
        {children}
      </Link>
    ) : (
      <a href={href} className="link" {...rest}>
        {children}
      </a>
    ),
  Callout,
  IslandFigure,
  RuleTable,
  Sprites,
  Swatches,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
