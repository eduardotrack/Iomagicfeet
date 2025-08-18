import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from './styles.css';

const BASE_URL = "/api/catalog_system/pub/category/tree/3/";
const DEFAULT_FIXED_CATEGORIES = ["tênis", "chinelos e sandálias", "chuteiras", "roupas", "ocasiões", "acessórios"];

const normalize = str =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const normalizeName = (name) => {
  if (!name || typeof name !== "string") return "";

  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .trim();
};

const CatalogSection = ({ title, titleUrl, items }) => {
  if (!items?.length) return null;

  const allChildrenless = items.every(item => item.children.length === 0);
  console.log('categoria catalogsection', items)
  return (
    <div className={styles.container_catalog} data-categoria={normalizeName(title)}>
      <a className={styles.title_catalog} href={titleUrl}>{title}</a>
      <div
        className={`${styles.catalog_items} ${allChildrenless ? styles.catalog_items_childrenless : ''}`}
      >
        {items.map(item => (
          <div key={item.id} data-marcaid={item.name}>
            {item.children.length > 0 ? (
              <>
                <a
                  className={styles.font_bold_catalog}
                  data-marca={item.icon ? '' : normalizeName(item.name)}
                  href={item.url}
                >
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt={item.name}
                      className={styles.icon_catalog}
                    />
                  )}
                  {item.name}
                </a>
                <ul className={styles.list_catalog}>
                  {item.children.map(sub => (
                    <li key={sub.id}>
                      <a href={sub.url} title={sub.name}>
                        {sub.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className={styles.list_catalog_raw}>
                <a
                  href={item.url}
                  title={item.name}
                  className={styles.font_bold_catalog}
                >
                  {item.icon && (
                    <img
                      src={item.icon}
                      alt={item.name}
                      className={styles.icon_catalog}
                    />
                  )}
                  {item.name}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};


const CatalogoControl = ({ customCatalogs = [], fixedCatalogs = DEFAULT_FIXED_CATEGORIES }) => {
  const [menuMap, setMenuMap] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(BASE_URL);
        const categories = response.data || [];

        const map = {};

        // Para cada categoria fixa informada no site editor
        fixedCatalogs.forEach(catName => {
          console.log(`Buscando categoria: ${catName}`);
          const matched = categories.find(cat => normalize(cat.name).includes(normalize(catName)));

          // Mantém tanto os items quanto a URL da categoria
          map[normalizeName(catName)] = {
            items: matched?.children || [],
            url: matched?.url || "#"
          };
        });

        // Tudo que não é uma categoria fixa vira "Marcas"
        map["marcas"] = {
          items: categories.filter(cat => {
            const name = normalize(cat.name);
            return !fixedCatalogs.some(fixed => name.includes(normalize(fixed)));
          })
        }

        setMenuMap(map);
        console.log("Categorias carregadas:", map);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    fetchCategories();
  }, [fixedCatalogs]);

  return (
    <div className={styles.catalogo_control}>
      <h1>Catálogo de produtos</h1>

      {fixedCatalogs.map((cat, index) => (
        <CatalogSection
          key={index}
          title={cat}
          titleUrl={menuMap[normalizeName(cat)]?.url}
          items={menuMap[normalizeName(cat)]?.items}
        />
      ))}

      <CatalogSection
        title="Marcas"
        items={menuMap.marcas?.items}
        titleUrl={"/marcas"}
      />

      {Array.isArray(customCatalogs) && customCatalogs.map((section, index) => (
        <CatalogSection
          key={index}
          title={section.title}
          titleUrl={section.url || '#'}
          items={section.items}
        />
      ))}
    </div>
  );
};

CatalogoControl.schema = {
  title: 'Controle de Catálogo',
  description: 'Configurações do catálogo de produtos, incluindo categorias automáticas e customizadas.',
  type: 'object',
  properties: {
    fixedCatalogs: {
      title: 'Categorias automáticas via API',
      description: 'Digite os nomes das categorias principais para buscar diretamente da API (ex: Roupas, Tênis, etc).',
      type: 'array',
      items: {
        type: 'string',
        title: 'Categoria'
      },
      default: DEFAULT_FIXED_CATEGORIES,
    },
    customCatalogs: {
      title: 'Coleções customizadas',
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: {
            title: 'Nome da categoria',
            type: 'string',
            description: 'Título principal da categoria personalizada',
          },
          url: {
            title: 'URL da categoria',
            type: 'string',
            description: 'Link para onde o título da categoria deve apontar (ex: /marcas)',
          },
          items: {
            title: 'Subcategorias',
            type: 'array',
            description: 'Grupos e subcategorias dessa coleção',
            items: {
              type: 'object',
              properties: {
                id: { type: 'number', title: 'ID do grupo' },
                name: { type: 'string', title: 'Nome do grupo' },
                url: { type: 'string', title: 'URL do grupo' },
                icon: { type: 'string', title: 'Ícone (URL ou nome)' },
                children: {
                  type: 'array',
                  title: 'Itens da subcategoria',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'number', title: 'ID do item' },
                      name: { type: 'string', title: 'Nome do item' },
                      url: { type: 'string', title: 'URL do item' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default CatalogoControl;
