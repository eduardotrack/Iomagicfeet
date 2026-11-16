/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- Focusable scroll regions support native horizontal keyboard navigation. */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCssHandles } from 'vtex.css-handles'
import { index as RichText } from 'vtex.rich-text'

import {
  filterCategories,
  getCategories,
  getSafeHref,
  getSettings,
  normalizeSearch,
} from './model'
import { getSchema } from './schema'
import { ASSET_DEFAULTS } from './assetDefaults'
import styles from './styles.css'

const CSS_HANDLES = [
  'faqPage',
  'faqBanner',
  'faqContent',
  'faqSectionTitle',
  'faqSupport',
  'faqSupportTrack',
  'faqSupportCard',
  'faqSupportIcon',
  'faqSupportTitle',
  'faqSupportDescription',
  'faqAction',
  'faqProgress',
  'faqProgressBar',
  'faqSearch',
  'faqSearchField',
  'faqSearchInput',
  'faqSearchClear',
  'faqCategories',
  'faqCategory',
  'faqCategoryButton',
  'faqCategoryIcon',
  'faqCategoryTitle',
  'faqCategoryPanel',
  'faqQuestion',
  'faqQuestionButton',
  'faqQuestionTitle',
  'faqAnswer',
  'faqContacts',
  'faqContactTrack',
  'faqContactCard',
  'faqContactIcon',
  'faqEmpty',
  'faqStatus',
]

const CATEGORY_ICONS = {
  cadastroendereco: 'registrationIcon',
  cancelamento: 'cancellationIcon',
  devolucaoetroca: 'exchangesIcon',
  entrega: 'deliveryIcon',
  lojasefranquias: 'storesIcon',
  pagamento: 'paymentsIcon',
  produto: 'productIcon',
  rastreamento: 'trackingIcon',
  retiradaemloja: 'pickupIcon',
}

const SUPPORT_ICONS = {
  stores: 'storeIcon',
  orders: 'orderIcon',
  returns: 'exchangeIcon',
}

const CONTACT_ICONS = {
  email: 'mailIcon',
  chat: 'chatIcon',
  phone: 'phoneIcon',
}

const MOBILE_CONTACT_ICONS = {
  email: 'mailMobileIcon',
  chat: 'chatMobileIcon',
  phone: 'phoneMobileIcon',
}

const STATIC_ASSET_KEYS = [
  'bannerDesktop',
  'bannerMobile',
  'bannerMobileOverlay',
  'storeIcon',
  'orderIcon',
  'exchangeIcon',
  'searchIcon',
  'registrationIcon',
  'cancellationIcon',
  'exchangesIcon',
  'deliveryIcon',
  'storesIcon',
  'paymentsIcon',
  'paymentsMobileIcon',
  'productIcon',
  'trackingIcon',
  'pickupIcon',
  'categoryChevron',
  'categoryChevronActive',
  'categoryChevronMobileActive',
  'questionChevron',
  'questionChevronOpen',
  'questionChevronMobile',
  'plusIcon',
  'minusIcon',
  'mailIcon',
  'mailMobileIcon',
  'chatIcon',
  'phoneIcon',
  'chatMobileIcon',
  'phoneMobileIcon',
  'slidersIcon',
  'paginationActiveIcon',
  'paginationInactiveIcon',
]

const cx = (...names) => names.filter(Boolean).join(' ')
const keyOf = (category, question) => `${category.id}--${question.id}`

// The Figma mobile stage is 344px tall and centered inside a 180px clip.
// Preserve its original composition; other presets align each image to the clip.
const mobileBannerLayerStyle = (position, layer) => {
  if (position === 'center center') {
    return { left: `${layer.left}%`, top: `${layer.top}%` }
  }

  const [horizontal, vertical] = position.split(' ')
  const left =
    horizontal === 'left'
      ? 0
      : horizontal === 'right'
      ? 100 - layer.width
      : (100 - layer.width) / 2

  const top =
    vertical === 'top'
      ? (82 / 344) * 100
      : vertical === 'bottom'
      ? (262 / 344) * 100 - layer.height
      : 50 - layer.height / 2

  return { left: `${left}%`, top: `${top}%` }
}

const MOBILE_BANNER_BASE = {
  width: 105.18,
  height: 150.44,
  left: -0.92,
  top: -27.12,
}

const MOBILE_BANNER_OVERLAY = {
  width: 156.94,
  height: 224.46,
  left: -29.68,
  top: -80.1,
}

const Icon = ({ src, className }) =>
  src ? (
    <span className={className} aria-hidden="true">
      <img src={src} alt="" />
    </span>
  ) : null

// A configured URL takes precedence. Otherwise use the storefront's existing chat.
const Action = ({ item, className, onChat }) => {
  const action = item.action || {}
  const href = getSafeHref(action)

  if (action.type === 'chat' && !href) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => onChat(action.message)}
      >
        {item.label}
      </button>
    )
  }

  return (
    <a
      className={className}
      href={href || undefined}
      target={action.newTab && href ? '_blank' : undefined}
      rel={action.newTab && href ? 'noopener noreferrer' : undefined}
      aria-disabled={!href || undefined}
    >
      {item.label}
    </a>
  )
}

// Keep native touch scrolling and synchronize the Figma pagination with it.
const Carousel = ({
  items,
  initialSlide = 0,
  label,
  className,
  progressClassName,
  barClassName,
  paginationActiveIcon,
  paginationInactiveIcon,
  renderItem,
}) => {
  const track = useRef(null)
  const [currentSlide, setCurrentSlide] = useState(initialSlide)

  const updateProgress = useCallback(() => {
    const element = track.current

    if (!element) return
    const children = Array.from(element.children)
    const distances = children.map((child) =>
      Math.abs(child.offsetLeft - element.offsetLeft - element.scrollLeft)
    )

    setCurrentSlide(distances.indexOf(Math.min(...distances)))
  }, [])

  useEffect(() => {
    const element = track.current

    if (!element) return undefined
    let initialized = false
    const measure = () => {
      if (!initialized) {
        if (window.matchMedia('(max-width: 1024px)').matches) {
          const child =
            element.children[Math.min(initialSlide, items.length - 1)]

          if (child) element.scrollLeft = child.offsetLeft - element.offsetLeft
          initialized = true
        }
      }

      updateProgress()
    }

    measure()
    const observer =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null

    if (observer) observer.observe(element)

    return () => {
      if (observer) observer.disconnect()
    }
  }, [initialSlide, items.length, updateProgress])
  const onScroll = () => {
    const element = track.current

    if (element) updateProgress()
  }

  const goToSlide = (index) => {
    const element = track.current
    const child = element && element.children[index]

    if (!child) return
    element.scrollTo({
      left: child.offsetLeft - element.offsetLeft,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }

  const onKeyDown = (event) => {
    if (
      event.target !== event.currentTarget ||
      !['ArrowLeft', 'ArrowRight'].includes(event.key)
    )
      return
    event.preventDefault()
    const element = track.current
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    element.scrollBy({
      left: element.clientWidth * (event.key === 'ArrowRight' ? 1 : -1),
      behavior: reduced ? 'auto' : 'smooth',
    })
  }

  return (
    <>
      <div
        ref={track}
        className={className}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        role="region"
        aria-label={label}
        tabIndex={0}
      >
        {items.map(renderItem)}
      </div>
      {items.length > 1 && (
        <div className={progressClassName} aria-label={label}>
          <div className={styles.paginationButtons}>
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={cx(
                  barClassName,
                  currentSlide === index && styles.paginationActive
                )}
                aria-label={`${item.title} (${index + 1}/${items.length})`}
                aria-current={currentSlide === index ? 'true' : undefined}
                onClick={() => goToSlide(index)}
              >
                <img
                  src={
                    currentSlide === index
                      ? paginationActiveIcon
                      : paginationInactiveIcon
                  }
                  alt=""
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

const Questions = ({
  category,
  variant,
  faq,
  assets,
  handles,
  openQuestions,
  toggleQuestion,
}) => (
  <div className={cx(styles.categoryPanel, handles.faqCategoryPanel)}>
    {category.questions.map((question) => {
      const itemKey = keyOf(category, question)
      const open = Boolean(openQuestions[itemKey])
      const id = `magicfeet-faq-${variant}-${itemKey}`

      return (
        <div
          key={question.id}
          className={cx(
            styles.question,
            handles.faqQuestion,
            open && styles.questionOpen
          )}
        >
          <h4 className={styles.questionHeading}>
            <button
              id={`${id}-button`}
              type="button"
              className={cx(styles.questionButton, handles.faqQuestionButton)}
              aria-expanded={open}
              aria-controls={`${id}-answer`}
              onClick={() => toggleQuestion(itemKey)}
            >
              <span
                className={cx(styles.questionTitle, handles.faqQuestionTitle)}
              >
                {question.pergunta}
              </span>
              <span
                className={cx(
                  styles.questionArrow,
                  open && styles.questionArrowOpen
                )}
                aria-hidden="true"
              >
                <img
                  src={
                    faq.questionArrowIcon ||
                    (open ? assets.questionChevronOpen : assets.questionChevron)
                  }
                  alt=""
                />
              </span>
              <span className={styles.questionMobileIcon} aria-hidden="true">
                <img
                  src={
                    open
                      ? faq.questionCollapseIcon || assets.minusIcon
                      : faq.questionExpandIcon || assets.plusIcon
                  }
                  alt=""
                />
              </span>
            </button>
          </h4>
          <div
            id={`${id}-answer`}
            hidden={!open}
            role="region"
            aria-labelledby={`${id}-button`}
            className={cx(styles.answer, handles.faqAnswer)}
          >
            <RichText text={question.resposta} />
          </div>
        </div>
      )
    })}
    {category.videoUrl && (
      <iframe
        className={styles.video}
        src={category.videoUrl}
        title={category.videoTitle || category.title}
        loading="lazy"
        allow="encrypted-media; picture-in-picture"
        allowFullScreen
      />
    )}
  </div>
)

const CentralRelacionamento = (props) => {
  const { handles } = useCssHandles(CSS_HANDLES)
  // CMS records saved before this page do not contain the asset map.
  // Keep verified immutable CDN defaults while allowing editor overrides.
  const staticAssets =
    props &&
    props.staticAssets &&
    typeof props.staticAssets === 'object' &&
    !Array.isArray(props.staticAssets)
      ? props.staticAssets
      : {}

  const assets = STATIC_ASSET_KEYS.reduce((resolved, key) => {
    resolved[key] = getSafeHref(staticAssets[key]) || ASSET_DEFAULTS[key]

    return resolved
  }, {})

  const settings = getSettings(props)
  const categories = getCategories(props).filter(
    (category) => category.visible && category.questions.length
  )

  const { banner, support, search, faq, contacts, appearance } = settings
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(faq.initialCategory)
  const [collapsed, setCollapsed] = useState(false)
  const active =
    categories.find((category) => category.id === selected) || categories[0]

  const initialOpen = () => {
    const category =
      categories.find((item) => item.id === faq.initialCategory) ||
      categories[0]

    if (!category || !faq.initialQuestion) return {}
    const question =
      faq.initialQuestion === 'first'
        ? category.questions[0]
        : category.questions.find((item) => item.id === faq.initialQuestion)

    return question ? { [keyOf(category, question)]: true } : {}
  }

  const [questionState, setQuestionState] = useState(null)

  useEffect(() => {
    setSelected(faq.initialCategory)
    setCollapsed(false)
    setQuestionState(null)
  }, [faq.initialCategory, faq.initialQuestion])
  const openQuestions = questionState === null ? initialOpen() : questionState
  const [chatMessage, setChatMessage] = useState('')
  const chatInFlight = useRef(false)
  const searching = Boolean(normalizeSearch(query))
  const results = filterCategories(categories, query)
  const onSelect = (id, variant) => {
    if (active && active.id === id) {
      if (variant === 'mobile') setCollapsed(!collapsed)
      else setCollapsed(false)

      return
    }

    setSelected(id)
    setCollapsed(false)
  }

  const toggleQuestion = (key) =>
    setQuestionState((current) => {
      const previous = current === null ? initialOpen() : current

      return { ...(faq.allowMultiple ? previous : {}), [key]: !previous[key] }
    })

  const openChat = async (initialMessage) => {
    if (chatInFlight.current) return
    chatInFlight.current = true
    setChatMessage('')
    const message =
      typeof initialMessage === 'string' ? initialMessage.trim() : ''

    try {
      // Both UMD exports are supported by Weni. Reuse the GTM instance so its
      // current conversation and session are preserved; never initialize it here.
      const exported = window.WebChat
      const api = [exported, exported && exported.default].find(
        (candidate) =>
          candidate &&
          typeof candidate.open === 'function' &&
          (!message || typeof candidate.send === 'function')
      )

      if (api) {
        await api.open()
        if (message) await api.send(message)

        return
      }

      // The DOM fallback can only open the widget. Never silently drop a
      // requested initial message when its sending API is unavailable.
      if (message) throw new Error('WebChat sending API unavailable')
      if (document.querySelector('button[aria-label="Close chat"]')) return
      const launcher = contacts.chatSelector
        ? document.querySelector(contacts.chatSelector)
        : null

      if (!launcher || typeof launcher.click !== 'function') {
        throw new Error('WebChat launcher unavailable')
      }

      launcher.click()
    } catch (_) {
      setChatMessage(contacts.chatUnavailableMessage)
    } finally {
      // A rejected send may already have reached the service: retry only after
      // another explicit click, never automatically through a second API alias.
      chatInFlight.current = false
    }
  }

  const visibleSupport = support.items.filter((item) => item.visible)
  const visibleContacts = contacts.items.filter((item) => item.visible)
  const vars = {
    '--faq-text': appearance.textColor,
    '--faq-muted': appearance.mutedColor,
    '--faq-surface': appearance.surfaceColor,
    '--faq-active': appearance.activeColor,
    '--faq-border': appearance.borderColor,
    '--faq-accent': appearance.accentColor,
    '--faq-max-width': `${appearance.maxWidth}px`,
  }

  const bannerImage = (
    <>
      <picture
        className={cx(
          styles.bannerPicture,
          !banner.mobileImage && styles.bannerDefaultPicture
        )}
      >
        <source
          media="(max-width: 1024px)"
          srcSet={banner.mobileImage || assets.bannerMobile}
        />
        <img
          src={banner.desktopImage || assets.bannerDesktop}
          alt={banner.alt}
          loading="eager"
          style={{
            '--faq-banner-position': banner.positionDesktop,
            '--faq-banner-mobile-position': banner.positionMobile,
          }}
        />
      </picture>
      {!banner.mobileImage && (
        <div className={styles.bannerMobile} role="img" aria-label={banner.alt}>
          <div className={styles.bannerMobileStage} aria-hidden="true">
            <div className={styles.bannerMobileLayer}>
              <img
                className={styles.bannerMobileBase}
                src={assets.bannerMobile}
                alt=""
                style={mobileBannerLayerStyle(
                  banner.positionMobile,
                  MOBILE_BANNER_BASE
                )}
              />
            </div>
            <div className={styles.bannerMobileLayer}>
              <img
                className={styles.bannerMobileOverlay}
                src={banner.mobileOverlayImage || assets.bannerMobileOverlay}
                alt=""
                style={mobileBannerLayerStyle(
                  banner.positionMobile,
                  MOBILE_BANNER_OVERLAY
                )}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )

  const renderCategoryButton = (category, variant) => {
    const isSelected = Boolean(
      active && active.id === category.id && !collapsed
    )

    return (
      <h3 className={styles.categoryHeading}>
        <button
          type="button"
          className={cx(
            styles.categoryButton,
            handles.faqCategoryButton,
            isSelected && styles.categorySelected
          )}
          id={`magicfeet-faq-${variant}-${category.id}-category`}
          aria-expanded={isSelected}
          aria-controls={`magicfeet-faq-${variant}-${category.id}-panel`}
          onClick={() => onSelect(category.id, variant)}
        >
          <Icon
            src={
              category.icon ||
              (category.id === 'pagamento' && !isSelected
                ? assets.paymentsMobileIcon
                : assets[CATEGORY_ICONS[category.id]])
            }
            className={cx(styles.categoryIcon, handles.faqCategoryIcon)}
          />
          <span className={cx(styles.categoryTitle, handles.faqCategoryTitle)}>
            {category.title}
          </span>
          <span
            className={cx(
              styles.categoryArrow,
              isSelected && styles.categoryArrowSelected
            )}
            aria-hidden="true"
          >
            <img
              src={
                isSelected
                  ? faq.activeCategoryArrowIcon ||
                    (variant === 'mobile'
                      ? assets.categoryChevronMobileActive
                      : assets.categoryChevronActive)
                  : faq.categoryArrowIcon || assets.categoryChevron
              }
              alt=""
            />
          </span>
        </button>
      </h3>
    )
  }

  const questionsProps = { faq, assets, handles, openQuestions, toggleQuestion }

  return (
    <div className={cx(styles.page, handles.faqPage)} style={vars}>
      {banner.visible && (
        <div className={cx(styles.banner, handles.faqBanner)}>
          {getSafeHref(banner.href) ? (
            <a href={getSafeHref(banner.href)}>{bannerImage}</a>
          ) : (
            bannerImage
          )}
        </div>
      )}
      <main
        className={cx(styles.content, handles.faqContent)}
        id="magicfeet-atendimento"
      >
        <section
          className={cx(styles.support, handles.faqSupport)}
          aria-labelledby="faq-support-title"
        >
          <h1
            id="faq-support-title"
            className={cx(styles.sectionTitle, handles.faqSectionTitle)}
          >
            {support.title}
          </h1>
          <Carousel
            items={visibleSupport}
            initialSlide={support.initialSlide}
            label={support.carouselLabel}
            className={cx(styles.supportTrack, handles.faqSupportTrack)}
            progressClassName={cx(styles.progress, handles.faqProgress)}
            barClassName={cx(styles.progressBar, handles.faqProgressBar)}
            paginationActiveIcon={
              appearance.paginationActiveIcon || assets.paginationActiveIcon
            }
            paginationInactiveIcon={
              appearance.paginationInactiveIcon || assets.paginationInactiveIcon
            }
            renderItem={(item) => (
              <article
                key={item.id}
                data-support-id={item.id}
                className={cx(
                  styles.supportCard,
                  item.id === 'stores' && styles.supportCardStores,
                  item.id === 'orders' && styles.supportCardOrders,
                  item.id === 'returns' && styles.supportCardReturns,
                  handles.faqSupportCard
                )}
              >
                <div className={styles.supportCardHeading}>
                  <Icon
                    src={item.icon || assets[SUPPORT_ICONS[item.id]]}
                    className={cx(styles.supportIcon, handles.faqSupportIcon)}
                  />
                  <h2
                    className={cx(styles.supportTitle, handles.faqSupportTitle)}
                  >
                    {item.title}
                  </h2>
                </div>
                <p
                  className={cx(
                    styles.supportDescription,
                    handles.faqSupportDescription
                  )}
                >
                  {item.description}
                </p>
                <Action
                  item={item}
                  className={cx(
                    styles.action,
                    styles.supportAction,
                    handles.faqAction
                  )}
                  onChat={openChat}
                />
              </article>
            )}
          />
        </section>

        <section
          className={cx(styles.search, handles.faqSearch)}
          aria-labelledby="faq-search-title"
        >
          <h2
            id="faq-search-title"
            className={cx(styles.sectionTitle, handles.faqSectionTitle)}
          >
            {search.title}
          </h2>
          <div className={cx(styles.searchField, handles.faqSearchField)}>
            <Icon
              src={search.icon || assets.searchIcon}
              className={styles.searchIcon}
            />
            <input
              type="search"
              className={cx(styles.searchInput, handles.faqSearchInput)}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setCollapsed(false)
              }}
              placeholder={search.placeholder}
              aria-label={search.inputLabel}
              aria-controls="faq-results"
              onKeyDown={(event) => {
                if (event.key === 'Escape') setQuery('')
              }}
            />
            {query && (
              <button
                type="button"
                className={cx(styles.searchClear, handles.faqSearchClear)}
                onClick={() => setQuery('')}
                aria-label={search.clearLabel}
              >
                ×
              </button>
            )}
          </div>
        </section>

        <section
          className={cx(styles.faq, handles.faqCategories)}
          aria-labelledby="faq-title"
        >
          <h2
            id="faq-title"
            className={cx(styles.sectionTitle, handles.faqSectionTitle)}
          >
            {faq.title}
          </h2>
          <div id="faq-results">
            {searching ? (
              <div className={styles.results}>
                <p className={styles.visuallyHidden} role="status">
                  {search.resultsLabel}
                </p>
                {results.length ? (
                  results.map((category) => (
                    <section key={category.id} className={styles.resultGroup}>
                      <h3 className={styles.resultTitle}>{category.title}</h3>
                      <Questions
                        category={category}
                        variant="search"
                        {...questionsProps}
                      />
                    </section>
                  ))
                ) : (
                  <div
                    role="status"
                    className={cx(styles.empty, handles.faqEmpty)}
                  >
                    <p>
                      {search.emptyTitle} &quot;{query}&quot;
                    </p>
                    {search.emptyDescription && (
                      <p>{search.emptyDescription}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className={styles.desktopFaq}>
                  <nav
                    className={styles.categoryNavigation}
                    aria-labelledby="faq-title"
                  >
                    {categories.map((category) => (
                      <div key={category.id} className={handles.faqCategory}>
                        {renderCategoryButton(category, 'desktop')}
                      </div>
                    ))}
                  </nav>
                  <div className={styles.desktopPanels}>
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        id={`magicfeet-faq-desktop-${category.id}-panel`}
                        aria-labelledby={`magicfeet-faq-desktop-${category.id}-category`}
                        hidden={
                          !active || active.id !== category.id || collapsed
                        }
                      >
                        {active && active.id === category.id && (
                          <Questions
                            category={category}
                            variant="desktop"
                            {...questionsProps}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.mobileFaq}>
                  {categories.map((category) => (
                    <section
                      key={category.id}
                      className={cx(styles.mobileCategory, handles.faqCategory)}
                    >
                      {renderCategoryButton(category, 'mobile')}
                      <div
                        id={`magicfeet-faq-mobile-${category.id}-panel`}
                        aria-labelledby={`magicfeet-faq-mobile-${category.id}-category`}
                        hidden={
                          !active || active.id !== category.id || collapsed
                        }
                      >
                        {active && active.id === category.id && (
                          <Questions
                            category={category}
                            variant="mobile"
                            {...questionsProps}
                          />
                        )}
                      </div>
                    </section>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        {contacts.visible && (
          <section
            className={cx(styles.contacts, handles.faqContacts)}
            aria-labelledby="faq-contacts-title"
          >
            <h2
              id="faq-contacts-title"
              className={cx(styles.sectionTitle, handles.faqSectionTitle)}
            >
              {contacts.title}
            </h2>
            <Carousel
              items={visibleContacts}
              initialSlide={contacts.initialSlide}
              label={contacts.title}
              className={cx(styles.contactTrack, handles.faqContactTrack)}
              progressClassName={cx(styles.progress, handles.faqProgress)}
              barClassName={cx(styles.progressBar, handles.faqProgressBar)}
              paginationActiveIcon={
                appearance.paginationActiveIcon || assets.paginationActiveIcon
              }
              paginationInactiveIcon={
                appearance.paginationInactiveIcon ||
                assets.paginationInactiveIcon
              }
              renderItem={(item) => (
                <article
                  key={item.id}
                  data-contact-id={item.id}
                  className={cx(styles.contactCard, handles.faqContactCard)}
                >
                  <span
                    className={cx(styles.contactIcon, handles.faqContactIcon)}
                    aria-hidden="true"
                  >
                    <img
                      className={styles.contactIconDesktop}
                      src={item.icon || assets[CONTACT_ICONS[item.id]]}
                      alt=""
                    />
                    <img
                      className={styles.contactIconMobile}
                      src={
                        item.icon ||
                        assets[MOBILE_CONTACT_ICONS[item.id]] ||
                        assets[CONTACT_ICONS[item.id]]
                      }
                      alt=""
                    />
                  </span>
                  <Action
                    item={item}
                    className={cx(styles.action, handles.faqAction)}
                    onChat={openChat}
                  />
                </article>
              )}
            />
          </section>
        )}
        {chatMessage && (
          <p role="status" className={cx(styles.status, handles.faqStatus)}>
            {chatMessage}
          </p>
        )}
      </main>
    </div>
  )
}

CentralRelacionamento.getSchema = getSchema

export default CentralRelacionamento
