import React from 'react';
import { canUseDOM, Helmet } from "vtex.render-runtime";

/**
 * Component to modify canonical URLs by removing query strings.
 * This ensures that URLs with filters (e.g., /categoria?filterBrand=1)
 * have a canonical link pointing to the base category page (e.g., /categoria).
 *
 * @component
 */
function CanonicalAdvanced() {
  if (!canUseDOM) {
    return <></>;
  }

  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  const canonicalUrl = `${protocol}//${hostname}${pathname}`;

  console.log('panda canonical', canonicalUrl);

  return (
    <Helmet>
      <link rel="canonical" href={canonicalUrl} key="canonical-clean" />
    </Helmet>
  );
}

export default CanonicalAdvanced;