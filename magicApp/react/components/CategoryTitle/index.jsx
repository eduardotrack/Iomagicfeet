import React, { useEffect, useState } from "react";
import style from "./styles.css";

function CategoryTitle({ pageTitle }) {
  const [title, setTitle] = useState(pageTitle);

  useEffect(() => {
    const handleTitleChange = () => {
      if (!pageTitle) {
        const documentTitle = document?.title || "";
        documentTitle.includes(":")
          ? setTitle(documentTitle.split(":")[0])
          : setTitle(documentTitle.split("-")[0]);
      }
    };

    handleTitleChange();

    const titleObserver = new MutationObserver(() => {
      handleTitleChange();
    });

    titleObserver.observe(document.querySelector("title"), { subtree: true, characterData: true, childList: true });

    return () => titleObserver.disconnect();

  }, [pageTitle]);

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
