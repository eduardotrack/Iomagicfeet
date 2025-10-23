import React, { useEffect, useState } from "react";
import style from "./styles.css";

function CategoryTitle({ pageTitle }) {
  const [pathname, setPathname] = useState(
    (typeof window !== 'undefined' && window.location)
      ? window.location.pathname
      : ''
  );

  const [title, setTitle] = useState(pageTitle || '');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!window.history.pushState.isPatched) {
      const originalPushState = window.history.pushState;
      window.history.pushState = function(...args) {
        originalPushState.apply(window.history, args);
        window.dispatchEvent(new Event('pushstate'));
      };
      window.history.pushState.isPatched = true;
    }

    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate', handleLocationChange);
    };
  }, []);

  useEffect(() => {
    if (pageTitle) {
      setTitle(pageTitle);
    } else {
      if (typeof document !== 'undefined') {
        const documentTitle = document.title || "";
        const newTitle = documentTitle.includes(":")
          ? documentTitle.split(":")[0]
          : documentTitle.split("-")[0];
        setTitle(newTitle.trim());
      }
    }
  }, [pathname, pageTitle]);

  return <h1 className={style.categoryTitle}>{title}</h1>;
}

CategoryTitle.schema = {
  title: "Panda | Título da Página de Categoria",
  description: "Altere o título da página de categoria.",
  type: "object",
  properties: {
    pageTitle: {
      title: 'Título da Página',
      description: "Altere o título da página de categoria.",
      type: 'string',
      default: null
    }
  }
}

export default CategoryTitle;
