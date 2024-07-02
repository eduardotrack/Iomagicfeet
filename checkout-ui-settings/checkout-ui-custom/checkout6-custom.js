// WARNING: THE USAGE OF CUSTOM SCRIPTS IS NOT SUPPORTED. VTEX IS NOT LIABLE FOR ANY DAMAGES THIS MAY CAUSE. THIS MAY BREAK YOUR STORE AND STOP SALES. IN CASE OF ERRORS, PLEASE DELETE THE CONTENT OF THIS SCRIPT.
/**
 * *****************************
 * LGPD
 * *****************************
 */
//
;(function () {
  'use strict'

  var version = '1.0.10'
  var appName = 'panda LGPD (' + version + ')'
  var userData
  var userProfileEmail
  var lastSavedEmailData // usado para casos onde o cliente está se cadastrando e editou o email antes de chegar no final da compra
  var options_consent = [
    'consent_correspondencia',
    'consent_email',
    'consent_mensagem',
    'consent_rede_social',
    'consent_telefone',
  ]

  console.log(appName)

  /**
   * *****************************
   * VENDORS / UTILS
   * *****************************
   */
  //

  function getQueryParams(qs) {
    qs = (qs || window.location.search).split('+').join(' ')

    var params = {},
      tokens,
      re = /[?&]?([^=]+)=([^&]*)/g

    while ((tokens = re.exec(qs))) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2])
    }

    return params
  }

  var PARAMS = getQueryParams()
  if (PARAMS && PARAMS.orderFormId) {
    sessionStorage.setItem('inSharedCheckoutFlow', 1)
  }

  function debounce(func, wait, immediate) {
    var timeout
    return function () {
      var context = this,
        args = arguments
      var later = function () {
        timeout = null
        if (!immediate) func.apply(context, args)
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) func.apply(context, args)
    }
  }

  function getStore() {
    return window.jsnomeLoja || (window.vtex || {}).accountName
  }

  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn()
    } else if (document.addEventListener) {
      document.addEventListener('DOMContentLoaded', fn)
    } else {
      document.attachEvent('onreadystatechange', function () {
        if (document.readyState !== 'loading') fn()
      })
    }
  }

  /**
   * *****************************
   * END VENDORS / UTILS
   * *****************************
   */

  /**
   * Capturar dados do usuário de dentro do masterdata, e se encontrar, atualiza o modal com opções
   */
  function loadUserData(email) {
    var proms
    var proms_years

    if (email || userProfileEmail) {
      proms = getUserDataByUserEmail(
        email || userProfileEmail,
        ['id', 'politica_privacidade'].concat(options_consent)
      )

      proms_years = getUserDataByUserEmail(
        email || userProfileEmail,
        ['id', 'overTwelveYears'].concat(options_consent)
      )
    }
    if (proms) {
      proms.then(function (result) {
        if (!(result || []).length || !result[0].id) {
          return
        }

        userData = result[0]
        var marketingAccet = false
        // for check with exist element
        for (var i = 0, l = options_consent.length; i < l; i = i + 1) {
          try {
            if ((userData || {})[options_consent[i]]) {
              marketingAccet = true
              $('#' + userData[options_consent[i]]).prop('checked', true)
            }
          } catch (e) {
            console.error(e)
          }
        }

        $('#marketingAccet').prop('checked', marketingAccet)

        return userData
      })
    }

    return proms
  }

  /**
   * Forçar atualização dos dados do HTML provindos do registro de dados
   */
  function forceUpdateFromRegister() {
    try {
      var consentWhenLogged = localStorage.getItem('saveConsentWhenLogged')
      for (var i = 0, l = options_consent.length; i < l; i = i + 1) {
        if (consentWhenLogged) {
          $('#' + options_consent[i]).prop(
            'checked',
            (consentWhenLogged || {})[options_consent[i]]
          )
        } else {
          $('#' + options_consent[i]).prop(
            'checked',
            (userData || {})[options_consent[i]]
          )
        }
      }
    } catch (e) {
      console.error(e)
    }
  }

  function setUserDataByEmail(email, values) {
    if (!email) {
      return Promise.reject()
    }
    lastSavedEmailData = email

    var proms

    if (userProfileEmail) {
      proms = getUserDataByUserEmail(
        userProfileEmail,
        ['id', 'politica_privacidade'].concat(options_consent)
      )
    }
    if (proms) {
      proms.then(function (result) {
        userData = result.id
        if (userData) {
          setUserDataByEmail(userProfileEmail, {
            politica_privacidade: event.target.checked,
          })
        } else {
          localStorage.setItem(
            'saveConsentLgpdWhenLogged',
            JSON.stringify({ politica_privacidade: event.target.checked })
          )
        }
      })
    }

    var urlPatch = '/api/io/safedata/CL/documents/'
    if (userData) {
      urlPatch = '/api/io/safedata/CL/documents/' + userData
    }
    var req = fetch(urlPatch, {
      method: 'PATCH',
      headers: {
        accept: '*/*',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
      },
      referrer: window.location.href,
      referrerPolicy: 'no-referrer-when-downgrade',
      mode: 'cors',
      body: (userData || {}).id
        ? JSON.stringify(values)
        : JSON.stringify(Object.assign({}, { email: email }, values)),
    })
    req
      .then(function (response) {
        if (response.status === 403) {
          throw new Error('403!')
        }

        // check all data it's ok
        var proms

        if (userProfileEmail) {
          proms = getUserDataByUserEmail(
            userProfileEmail,
            ['id', 'politica_privacidade'].concat(options_consent)
          )
        }
        if (proms) {
          proms.then(function (result) {
            userData = (result || []).shift()
            forceUpdateFromRegister()
          })
        }
      })
      .catch(function (e) {
        console.error(e)
      })

    return req
  }

  /**
   * Capturar dados do usuário do masterdata utilizando como chave o email
   *
   * @param {String} eail
   * @param {Array} fields
   */
  function getUserDataByUserEmail(email, fields) {
    // TODO: vtex não funciona corretamente com emails que contem sinal de mais (+)
    return fetch(
      '/api/io/safedata/CL/documents/search/?_where=email=' +
        email +
        '&_fields=' +
        fields.join(),
      {
        method: 'GET',
      }
    )
      .then(function (res) {
        return res.json()
      })
      .then(function (data) {
        return data
      })
      .catch(function (e) {
        console.log(appName, e)
        return null
      })
  }

  /**
   * Exibir campos para seleção no checkout
   */
  function showCustomOptinFields() {
    var $newsletter = $('#client-profile-data .newsletter')

    if (!$newsletter.is(':visible')) return

    var marketingAccet = false
    var politicaPrivacidade = false
    var overTwelveYears = false
    var isAcceptedLgpd = false

    try {
      var consentWhenLogged = localStorage.getItem('saveConsentWhenLogged')
      for (var i = 0, l = options_consent.length; i < l; i = i + 1) {
        if (consentWhenLogged) {
          $('#' + options_consent[i]).prop(
            'checked',
            (consentWhenLogged || {})[options_consent[i]]
          )
          if ((consentWhenLogged || {})[options_consent[i]]) {
            marketingAccet = true
          }
        } else {
          $('#' + options_consent[i]).prop(
            'checked',
            (userData || {})[options_consent[i]]
          )
          if ((userData || {})[options_consent[i]]) {
            marketingAccet = true
          }
        }
      }

      if ((consentWhenLogged || {}).politica_privacidade) {
        politicaPrivacidade = true
        overTwelveYears = true
        isAcceptedLgpd = true
      } else if ((userData || {}).politica_privacidade) {
        politicaPrivacidade = true
        overTwelveYears = true
        isAcceptedLgpd = true
      }
    } catch (e) {
      console.error(e)
    }

    var textOptionContacted =
      "Concordo que os meus dados pessoais sejam coletados para o envio de newsletter e ativações de campanhas de marketing, conforme descrito na <a href='/institucional/politica-de-privacidade' target='_blank'>Política de Privacidade</a>."

    var textOptionAccept_years = $('<span />').html(
      'Declaro ser maior de 12 anos e concordo que os meus dados pessoais sejam coletados para o retorno das minhas solicitações, controle interno e acompanhamento da demanda.'
    )
    //   var $items_years = [

    //   ];

    var textOptionAccept = $('<span />').html(
      "Estou de acordo com a <a href='/institucional/politica-de-privacidade' target='_blank'>Política de Privacidade</a> com os <a href='/institucional/termos-de-uso' target='_blank'>Termos de Uso e Condições</a> e com o <a href='/regulamentocrm' target='_blank'>Regulamento Programa de Cashback, via CRM Bönus</a> e ciente de que os dados de menores de 12 anos não são tratados pelo Grupo AFEET nos portais web. Para mais informações, leia nossa <a href='/institucional/politica-de-privacidade' target='_blank'>Política de Privacidade</a>, nossos <a href='/institucional/termos-de-uso' target='_blank'>Termos de Uso e Condições</a> e nosso <a href='/regulamentocrm' target='_blank'>Regulamento Programa de Cashback, via CRM Bönus</a>."
    )
    var $items = [
      $('<p>', {
        class: 'col-2 form-check-terms',
        html: [
          $('<input>', {
            change: function (event) {
              var proms

              if (userProfileEmail) {
                proms = getUserDataByUserEmail(
                  userProfileEmail,
                  ['id', 'politica_privacidade'].concat(options_consent)
                )
              }
              if (proms) {
                proms.then(function (result) {
                  userData = result.id
                  if (userData) {
                    setUserDataByEmail(userProfileEmail, {
                      politica_privacidade: event.target.checked,
                    })
                  } else {
                    localStorage.setItem(
                      'saveConsentLgpdWhenLogged',
                      JSON.stringify({
                        politica_privacidade: event.target.checked,
                      })
                    )
                  }
                })
              }
            },
            type: 'checkbox',
            checked: politicaPrivacidade,
            id: 'isAcceptedLgpd',
          }),
          $('<label>', {
            for: 'isAcceptedLgpd',
          }).html(textOptionAccept),
        ],
      }),
      $('<p>', {
        class: 'col-2 form-check-terms',
        html: [
          $('<input>', {
            change: function (event) {
              var proms

              if (userProfileEmail) {
                proms = getUserDataByUserEmail(
                  userProfileEmail,
                  ['id', 'politica_privacidade'].concat(options_consent)
                )
              }
              if (proms) {
                proms.then(function (result) {
                  userData = result.id
                  if (userData) {
                    setUserDataByEmail(userProfileEmail, {
                      overTwelveYears: event.target.checked,
                    })
                  } else {
                    localStorage.setItem(
                      'saveConsentLgpdWhenLogged',
                      JSON.stringify({ overTwelveYears: event.target.checked })
                    )
                  }
                })
              }
            },

            type: 'checkbox',
            checked: overTwelveYears,
            id: 'overTwelveYears',
          }),
          $('<label>', {
            for: 'overTwelveYears',
          }).html(textOptionAccept_years),
        ],
      }),

      $('<p>', {
        class: 'col-2 form-check-terms',
        html: [
          $('<input>', {
            change: function (event) {
              var proms

              if (userProfileEmail) {
                proms = getUserDataByUserEmail(
                  userProfileEmail,
                  ['id', 'politica_privacidade'].concat(options_consent)
                )
              }
              if (proms) {
                proms.then(function (result) {
                  userData = result.id
                  if (userData) {
                    setUserDataByEmail(userProfileEmail, {
                      marketingAccet: event.target.checked,
                    })
                  }
                })
              }
            },
            change: function (event) {
              var proms

              if (userProfileEmail) {
                proms = getUserDataByUserEmail(
                  userProfileEmail,
                  ['id', 'politica_privacidade'].concat(options_consent)
                )
              }
              if (proms) {
                proms.then(function (result) {
                  userData = result.id
                  if (userData) {
                    setUserDataByEmail(userProfileEmail, {
                      marketingAccet: event.target.checked,
                    })
                  }
                })
              }
            },
            type: 'checkbox',
            checked: marketingAccet,
            id: 'marketingAccet',
          }),
          $('<label>', {
            for: 'marketingAccet',
          }).html(textOptionContacted),
        ],
      }),
    ]

    //   $newsletter.after($items_years);
    $newsletter.after($items)
    $newsletter.remove()
  }

  /**
   * Quando usuário se autenticar
   */
  var onUserLogged = setInterval(function () {
    var consentWhenLogged = localStorage.getItem('saveConsentWhenLogged')
    if (consentWhenLogged) {
      try {
        consentWhenLogged = JSON.parse(consentWhenLogged)
        if (consentWhenLogged && (userData || {}).id) {
          setUserDataByEmail(userProfileEmail, consentWhenLogged).then(
            function (response) {
              if (response.status === 403) {
                return
              }
              console.info(
                appName,
                'Apagando localstorage saveConsentWhenLogged'
              )
              localStorage.removeItem('saveConsentWhenLogged')
              clearInterval(onUserLogged)
            }
          )
        }
      } catch (e) {
        console.error(e)
      }
    }

    var consentLgpdWhenLogged = localStorage.getItem(
      'saveConsentLgpdWhenLogged'
    )
    if (consentLgpdWhenLogged) {
      try {
        consentLgpdWhenLogged = JSON.parse(consentLgpdWhenLogged)
        if (consentLgpdWhenLogged && (userData || {}).id) {
          setUserDataByEmail(userProfileEmail, consentLgpdWhenLogged).then(
            function (response) {
              if (response.status === 403) {
                return
              }
              console.info(
                appName,
                'apagando localstorage saveConsentLgpdWhenLogged'
              )
              localStorage.removeItem('saveConsentLgpdWhenLogged')
              clearInterval(onUserLogged)
            }
          )
        }
      } catch (e) {
        console.error(e)
      }
    }
  }, 3000)

  /**
   * Quando usuário desejar aceitar o modal de LGPD
   */
  var onSaveModalLgpdAccept = function () {
    var data = {
      politica_privacidade: true,
      overTwelveYears: true,
    }

    var proms

    if (userProfileEmail) {
      proms = getUserDataByUserEmail(
        userProfileEmail,
        ['id', 'politica_privacidade'].concat(options_consent)
      )
    }
    if (proms) {
      proms.then(function (result) {
        userData = result.id
        if (userData) {
          setUserDataByEmail(userProfileEmail, data).then(function () {
            console.info(
              appName,
              'apagando localstorage saveConsentLgpdWhenLogged'
            )
            localStorage.removeItem('saveConsentLgpdWhenLogged')
            clearInterval(onUserLogged)
            userData.politica_privacidade = true
            userData.overTwelveYears = true
            $('#myModalAcceptLgdp').modal('hide')
          })
        } else {
          localStorage.setItem(
            'saveConsentLgpdWhenLogged',
            JSON.stringify(data)
          )
        }
      })
    }
  }

  /**
   * Quando usuário aceitar concentimento para opções de contato
   */
  var onSaveModalConsentAccept = function () {
    var data = {}
    var marketingAccet = false

    for (var i = 0, l = options_consent.length; i < l; i = i + 1) {
      try {
        data[options_consent[i]] = $('#' + options_consent[i]).is(':checked')
        if (data[options_consent[i]]) {
          marketingAccet = true
        }
      } catch (e) {
        console.error(e)
      }
    }

    var proms

    if (userProfileEmail) {
      proms = getUserDataByUserEmail(
        userProfileEmail,
        ['id', 'politica_privacidade'].concat(options_consent)
      )
    }
    if (proms) {
      proms.then(function (result) {
        userData = result.id
        if (userData) {
          setUserDataByEmail(userProfileEmail, data).then(function () {
            console.info(appName, 'apagando localstorage saveConsentWhenLogged')
            localStorage.removeItem('saveConsentWhenLogged')
            clearInterval(onUserLogged)
          })
        } else {
          localStorage.setItem('saveConsentWhenLogged', JSON.stringify(data))
        }
      })
    }

    $('#marketingAccet').prop('checked', marketingAccet)
  }

  /**
   * Validar conteúdo com base na etapa que o cliente está navegando do checkout
   */
  var validateStep = debounce(function () {
    try {
      if (
        !(((window.API || {}).orderForm || {}).clientProfileData || {}).email
      ) {
        return false
      }

      if (
        (window.location.hash === '#/cart' ||
          window.location.hash === '#/email') &&
        !userProfileEmail
      ) {
        return
      }

      userProfileEmail = (
        ((window.API || {}).orderForm || {}).clientProfileData || {}
      ).email

      if (lastSavedEmailData && lastSavedEmailData !== userProfileEmail) {
        // usuário trocou o email no meio do processo de compra no primeiro cadastro, depois de já ter salvo as informações no masterdata
        // então vamos seguir com o update para este novo email
        console.log(
          appName,
          'realizando update em novo usuário por causa de mudança de email pelo usuário'
        )
        loadUserData(lastSavedEmailData).then(function (result) {
          try {
            if (!(result || []).length || !result[0].id) {
              return
            }
            var data = result[0]
            var dataToSave = Object.keys(data)
              .filter(function (item) {
                return options_consent.includes(item)
              })
              .reduce(function (stack, key) {
                Object.assign(stack, {
                  [key]: data[key],
                })
                return stack
              }, {})
            setUserDataByEmail(userProfileEmail, dataToSave)
            validateStep()
          } catch (e) {
            console.error(appName, e)
          }
        })
        return
      }

      var proms = loadUserData()

      if (proms) {
        proms.then(function (result) {
          var data

          if ((result || []).length && result[0].id) {
            data = result[0]
          }

          // se conseguiu chegar no checkout e mesmo assim ainda não conseguimos validar o user id
          if (sessionStorage.getItem('inSharedCheckoutFlow')) {
            return
          }

          if (
            window.location.hash === '#/payment' &&
            userProfileEmail.indexOf('*') > -1
          ) {
            // se passou das etapas e ainda não tem email publico, forçar autenticação real
            vtexid.start()
            window.scrollTo(0, 0)
            return
          }

          if (
            (window.location.hash === '#/payment' ||
              window.location.hash === '#/shipping') &&
            data &&
            !data.politica_privacidade
          ) {
            $('#myModalAcceptLgdp').modal({
              keyboard: false,
              backdrop: 'static',
            })
          } else {
            var isAcceptedLgpd = true
            var overTwelveYears = true
            var marketingAccet = true
            $('#isAcceptedLgpd').prop('checked', isAcceptedLgpd)
            $('#overTwelveYears').prop('checked', overTwelveYears)
            $('#marketingAccet').prop('checked', marketingAccet)
          }
        })
      }
    } catch (e) {
      console.error(e)
    }
    return false
  }, 700)

  /**
   * Start da aplicação
   */
  function init() {
    setInterval(showCustomOptinFields, 500)
    $(window).on('orderFormUpdated.vtex', validateStep)
    window.cart.items.subscribe(validateStep)
    $(window).on('hashchange', validateStep)
  }

  // quando DOM estiver pronto
  ready(function () {
    init()
    document.head.appendChild(scriptP)

    $('head').append(
      '<link href="/files/custom-lgpd-checkout.css?v=' +
        version +
        '" rel="stylesheet" />'
    )

    $('#myModal-termo-aceite').on('click', function () {
      onSaveModalConsentAccept()
    })
    $('#myModalAcceptLgdpAccept').on('click', function () {
      onSaveModalLgpdAccept()
    })
    $('#myModal-termo').on('hidden.bs.modal', function (e) {
      forceUpdateFromRegister()
    })
    $(document).on('click', '.vtexIdUI .modal-header .close', function (e) {
      if (
        window.location.hash === '#/payment' ||
        window.location.hash === '#/shipping'
      ) {
        window.location.hash = '#/profile'
      }
    })
    $('#myModalAcceptLgdp').on('hidden.bs.modal', function (e) {
      if (
        (window.location.hash === '#/payment' ||
          window.location.hash === '#/shipping') &&
        !(userData || {}).politica_privacidade
      ) {
        window.location.hash = '#/cart'
      }
    })

    $('#overTwelveYears_modal').change(function () {
      if (this.checked) {
        var element = document.getElementById('col-btn-modal-accept')
        element.classList.remove('disable-modal-cta')
      } else {
        var element = document.getElementById('col-btn-modal-accept')
        element.classList.add('disable-modal-cta')
      }
    })

    if($("#isAcceptedLgpd")) {
      $("#client-profile-data .submit.btn-submit-wrapper").on(
        "click",
        function(event) {
            if (!$("#isAcceptedLgpd").is(":checked")) {
                event.preventDefault();
                event.stopPropagation();
                $('[for="isAcceptedLgpd"]')
                    .stop()
                    .fadeOut(100)
                    .fadeIn(100)
                    .fadeOut(100)
                    .fadeIn(100)
                    .fadeOut(100)
                    .fadeIn(100)
                    .addClass('obrigatorio');

                $('[for="overTwelveYears"]').removeClass('obrigatorio');
                return false;
            } else if (!$("#overTwelveYears").is(":checked")) {
                event.preventDefault();
                event.stopPropagation();
                $('[for="overTwelveYears"]')
                    .stop()
                    .fadeOut(100)
                    .fadeIn(100)
                    .fadeOut(100)
                    .fadeIn(100)
                    .fadeOut(100)
                    .fadeIn(100)
                    .addClass('obrigatorio');

                $('[for="isAcceptedLgpd"]').removeClass('obrigatorio');
            } else {
                $('[for="isAcceptedLgpd"]').removeClass('obrigatorio');
                $('[for="overTwelveYears"]').removeClass('obrigatorio');
            }
        }
    );
    }

  })
})()
/**
 * *****************************
 * LGPD
 * *****************************
 */
//



/**
 * *****************************
 * ROCKET
 * *****************************
 */
//


var rrPartnerId = "6359804a1e03932729115ead";
var rrApi = {};
var rrApiOnReady = rrApiOnReady || [];
rrApi.addToBasket = rrApi.order = rrApi.categoryView = rrApi.view =
    rrApi.recomMouseDown = rrApi.recomAddToCart = function() {};
(function(d) {
    var ref = d.getElementsByTagName('script')[0];
    var apiJs, apiJsId = 'rrApi-jssdk';
    if (d.getElementById(apiJsId)) return;
    apiJs = d.createElement('script');
    apiJs.id = apiJsId;
    apiJs.async = true;
    apiJs.src = "//mcdn.retailrocket.net/content/javascript/trackingm.js";
    ref.parentNode.insertBefore(apiJs, ref);
}(document));

$(window).load(function() {
    $('.empty-cart-content').append('<div data-retailrocket-markup-block="635abf30020e5a151a7ecedc"></div>')

    function pandaLayer() {
        for (var i = 0; i < dataLayer.length; i++) {
            if (dataLayer[i].event == 'cartLoaded') {
                return dataLayer[i]
            }
        }
    }

    const products = pandaLayer()
    const arrayProducts = products.ecommerce.checkout.products

    const productsAjust = [];

    for (var i = 0, l = arrayProducts.length; i < l; i++) {
        console.log(arrayProducts[i])
        productsAjust.push(arrayProducts[i].id);
    }

    const arrayCheckout = (productsAjust.join(", "));

    $('.cart-active').append(`<div data-retailrocket-markup-block='635abf26020e5a151a7ecedb' data-product-ids='${arrayCheckout}'></div>`)

    retailrocket.markup.render();
});

/**
 * *****************************
 * ROCKET
 * *****************************
 */
//

/* TAGS */

$(window).on('orderFormUpdated.vtex', function(evt, orderForm) {
    setTimeout(function() {
        const shippingData = orderForm.shippingData.logisticsInfo

        $.each(shippingData, function(index, value) {
            let tipoEntrega = value.selectedSla
            let sku = value.itemId

            if (tipoEntrega == null) {
                var checSla = value.slas

                if(checSla.length != 0){
                    if(value.selectedSla == null){
                        textoFinal = 'Retirar na loja'
                    }else{
                        var textoFinal = value.selectedSla.split(' (')[0]
                    }
                }else{
                    textoFinal = 'Informe seu CEP'
                }
            } else if (tipoEntrega == "Normal") {
                var textoFinal = 'Receber em Casa'
            }else{
                var textoFinal =  value.selectedSla.split(' (')[0]
            }

            var url_atual = window.location.href;

            if (url_atual.indexOf('cart') != -1) {
                var dataIncertTable = document.querySelectorAll('.cart-items tr[data-sku="' + sku + '"]')

                $.each(dataIncertTable, function(index, value) {
                   var verificaBox = value.children[1]?.children[2]?.children[3]?.classList?.value

                    if (verificaBox == 'box-delivery') {
                        $(value.children[1]?.children[2].lastChild).remove()
                        $(value.children[1]?.children[2].lastChild).remove()
                    }

                    console.log(value.children[0]?.children[1]?.childNodes[4])

                    var LocalInsert =value.children[0]?.children[1]
                    $(LocalInsert).append('<br /><span class="box-delivery">' + textoFinal + '</span>')
                })
            }

            if ((url_atual.indexOf('email') != -1) || (url_atual.indexOf('shipping') != -1) || (url_atual.indexOf('payment') != -1)) {
                var dataIncertTable = document.querySelectorAll('.cart-items li[data-sku="' + sku + '"]')

                $.each(dataIncertTable, function(index, value) {
                    var verificaBox = value.lastChild?.classList?.value

                    if (verificaBox == 'box-delivery') {
                        $(value.lastChild).remove()
                    }

                    var LocalInsert = value
                    $(LocalInsert).append('<br /><span class="box-delivery">' + textoFinal + '</span>')
                })
            }
        });
    }, 3000)
});

/* TAGS */

$(window).on("orderFormUpdated.vtex", function(evt, orderForm) {
    let checkCart = orderForm.items.length || null

    if(checkCart == 0){
      $('*[data-retailrocket-markup-block="635abf30020e5a151a7ecedc"]').removeAttr("initialized");
      $('*[data-retailrocket-markup-block="635abf26020e5a151a7ecedb"]').removeAttr("initialized");

      delete retailrocket.modules.duplicates;
      retailrocket.markup.render();
    }
  })


  // Alerta sobre entregas
$( document ).ready(function() {
  setTimeout(function(){
    var boxData = document.querySelectorAll('.srp-data') || null

    if(boxData){
        boxData.forEach(function(item){
            $(item).prepend(`
            <div class="boxDataAlert">
                <div class="boxDataAlert--image">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <rect width="12" height="12" fill="url(#pattern0_19_642)"/>
                        <defs>
                        <pattern id="pattern0_19_642" patternContentUnits="objectBoundingBox" width="1" height="1">
                        <use xlink:href="#image0_19_642" transform="scale(0.01)"/>
                        </pattern>
                        <image id="image0_19_642" width="100" height="100" xlink:href="data:image/png;base64,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"/>
                        </defs>
                    </svg>
                </div>

                <div class="boxDataAlert--text">
                    <p>Aviso: Pedidos para regiões do Rio Grande do Sul podem sofrer atrasos ou cancelamentos.</p>
                </div>
            </div>`)
        })
    }
  }, 2000)
});
