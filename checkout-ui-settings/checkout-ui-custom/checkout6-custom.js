// WARNING: THE USAGE OF CUSTOM SCRIPTS IS NOT SUPPORTED. VTEX IS NOT LIABLE FOR ANY DAMAGES THIS MAY CAUSE. THIS MAY BREAK YOUR STORE AND STOP SALES. IN CASE OF ERRORS, PLEASE DELETE THE CONTENT OF THIS SCRIPT.

/**
 * *****************************
 * LGPD
 * *****************************
 */
//
(function() {
    "use strict";

    var version = "1.0.10";
    var appName = "panda LGPD (" + version + ")";
    var userData;
    var userProfileEmail;
    var lastSavedEmailData; // usado para casos onde o cliente está se cadastrando e editou o email antes de chegar no final da compra
    var options_consent = [
        "consent_correspondencia",
        "consent_email",
        "consent_mensagem",
        "consent_rede_social",
        "consent_telefone",
    ];

    console.log(appName);

    /**
     * *****************************
     * VENDORS / UTILS
     * *****************************
     */
    //

    function getQueryParams(qs) {
        qs = (qs || window.location.search).split("+").join(" ");

        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while ((tokens = re.exec(qs))) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }

    var PARAMS = getQueryParams();
    if (PARAMS && PARAMS.orderFormId) {
        sessionStorage.setItem("inSharedCheckoutFlow", 1);
    }

    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this,
                args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    function getStore() {
        return window.jsnomeLoja || (window.vtex || {}).accountName;
    }

    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else if (document.addEventListener) {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            document.attachEvent("onreadystatechange", function() {
                if (document.readyState !== "loading") fn();
            });
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

        var proms;
        var proms_years;

        if (email || userProfileEmail) {
            proms = getUserDataByUserEmail(
                email || userProfileEmail, ["id", "politica_privacidade"].concat(options_consent)
            );

            proms_years = getUserDataByUserEmail(
                email || userProfileEmail, ["id", "overTwelveYears"].concat(options_consent)
            );
        }
        if (proms) {
            proms.then(function(result) {
                if (!(result || []).length || !result[0].id) {
                    return;
                }

                userData = result[0];
                var marketingAccet = false;
                // for check with exist element
                for (var i = 0, l = options_consent.length; i < l; i = i + 1) {
                    try {
                        if ((userData || {})[options_consent[i]]) {
                            marketingAccet = true;
                            $("#" + userData[options_consent[i]]).prop("checked", true);
                        }
                    } catch (e) {
                        console.error(e);
                    }
                }

                $("#marketingAccet").prop("checked", marketingAccet);

                return userData;
            });
        }

        return proms;
    }

    /**
     * Forçar atualização dos dados do HTML provindos do registro de dados
     */
    function forceUpdateFromRegister() {
        try {
            var consentWhenLogged = localStorage.getItem("saveConsentWhenLogged");
            for (var i = 0, l = options_consent.length; i < l; i = i + 1) {
                if (consentWhenLogged) {
                    $("#" + options_consent[i]).prop(
                        "checked",
                        (consentWhenLogged || {})[options_consent[i]]
                    );
                } else {
                    $("#" + options_consent[i]).prop(
                        "checked",
                        (userData || {})[options_consent[i]]
                    );
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    function setUserDataByEmail(email, values) {
        if (!email) {
            return Promise.reject();
        }
        lastSavedEmailData = email;

        var proms;

        if (userProfileEmail) {
            proms = getUserDataByUserEmail(
                userProfileEmail, ["id", "politica_privacidade"].concat(options_consent)
            );
        }
        if (proms) {
            proms.then(function(result) {
                userData = result.id;
                if (userData) {
                    setUserDataByEmail(userProfileEmail, {
                        politica_privacidade: event.target.checked,
                    });
                } else {
                    localStorage.setItem(
                        "saveConsentLgpdWhenLogged",
                        JSON.stringify({ politica_privacidade: event.target.checked })
                    );
                }
            });
        }

        var urlPatch = "/api/io/safedata/CL/documents/";
        if (userData) {
            urlPatch = "/api/io/safedata/CL/documents/" + userData;
        }
        var req = fetch(urlPatch, {
            method: "PATCH",
            headers: {
                accept: "*/*",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                "content-type": "application/json",
                "cache-control": "no-cache",
                pragma: "no-cache",
            },
            referrer: window.location.href,
            referrerPolicy: "no-referrer-when-downgrade",
            mode: "cors",
            body: (userData || {}).id ? JSON.stringify(values) : JSON.stringify(Object.assign({}, { email: email }, values)),
        });
        req.then(function(response) {
            if (response.status === 403) {
                throw new Error('403!');
            }

            // check all data it's ok
            var proms;

            if (userProfileEmail) {
                proms = getUserDataByUserEmail(
                    userProfileEmail, ["id", "politica_privacidade"].concat(options_consent)
                );
            }
            if (proms) {
                proms.then(function(result) {
                    userData = (result || []).shift();
                    forceUpdateFromRegister();
                });
            }
        }).catch(function(e) {
            console.error(e);
        });

        return req;

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
                "/api/io/safedata/CL/documents/search/?_where=email=" +
                email +
                "&_fields=" +
                fields.join(), {
                    method: "GET",
                }
            )
            .then(function(res) {
                return res.json();
            })
            .then(function(data) {
                return data;
            })
            .catch(function(e) {
                console.log(appName, e);
                return null;
            });
    }

    /**
     * Exibir campos para seleção no checkout
     */
    function showCustomOptinFields() {
        var $newsletter = $("#client-profile-data .newsletter");

        if (!$newsletter.is(":visible")) return;

        var marketingAccet = false;
        var politicaPrivacidade = false;
        var overTwelveYears = false;
        var isAcceptedLgpd = false;

        try {
            var consentWhenLogged = localStorage.getItem("saveConsentWhenLogged");
            for (var i = 0, l = options_consent.length; i < l; i = i + 1) {
                if (consentWhenLogged) {
                    $("#" + options_consent[i]).prop(
                        "checked",
                        (consentWhenLogged || {})[options_consent[i]]
                    );
                    if ((consentWhenLogged || {})[options_consent[i]]) {
                        marketingAccet = true;
                    }
                } else {
                    $("#" + options_consent[i]).prop(
                        "checked",
                        (userData || {})[options_consent[i]]
                    );
                    if ((userData || {})[options_consent[i]]) {
                        marketingAccet = true;
                    }
                }
            }

            if ((consentWhenLogged || {}).politica_privacidade) {
                politicaPrivacidade = true;
                overTwelveYears = true;
                isAcceptedLgpd = true
            } else if ((userData || {}).politica_privacidade) {
                politicaPrivacidade = true;
                overTwelveYears = true;
                isAcceptedLgpd = true
            }
        } catch (e) {
            console.error(e);
        }

        var textOptionContacted = "Concordo que os meus dados pessoais sejam coletados para o envio de newsletter e ativações de campanhas de marketing, conforme descrito na <a href='/institucional/politica-de-privacidade' target='_blank'>Política de Privacidade</a>.";

        var textOptionAccept_years = $("<span />").html(
            "Declaro ser maior de 12 anos e concordo que os meus dados pessoais sejam coletados para o retorno das minhas solicitações, controle interno e acompanhamento da demanda.");
        //   var $items_years = [

        //   ];




        var textOptionAccept = $("<span />").html(
            "Estou de acordo com a <a href='/institucional/politica-de-privacidade' target='_blank'>Política de Privacidade</a> com os <a href='/institucional/termos-de-uso' target='_blank'>Termos de Uso e Condições</a> e com o <a href='/regulamentocrm' target='_blank'>Regulamento Programa de Cashback, via CRM Bönus</a> e ciente de que os dados de menores de 12 anos não são tratados pelo Grupo AFEET nos portais web. Para mais informações, leia nossa <a href='/institucional/politica-de-privacidade' target='_blank'>Política de Privacidade</a>, nossos <a href='/institucional/termos-de-uso' target='_blank'>Termos de Uso e Condições</a> e nosso <a href='/regulamentocrm' target='_blank'>Regulamento Programa de Cashback, via CRM Bönus</a>.");
        var $items = [
            $("<p>", {
                class: "col-2 form-check",
                html: [
                    $("<input>", {
                        change: function(event) {
                            var proms;

                            if (userProfileEmail) {
                                proms = getUserDataByUserEmail(
                                    userProfileEmail, ["id", "politica_privacidade"].concat(options_consent)
                                );
                            }
                            if (proms) {
                                proms.then(function(result) {
                                    userData = result.id;
                                    if (userData) {
                                        setUserDataByEmail(userProfileEmail, {
                                            politica_privacidade: event.target.checked,
                                        });
                                    } else {
                                        localStorage.setItem(
                                            "saveConsentLgpdWhenLogged",
                                            JSON.stringify({ politica_privacidade: event.target.checked })
                                        );
                                    }
                                });
                            }

                        },
                        type: "checkbox",
                        checked: politicaPrivacidade,
                        id: "isAcceptedLgpd",
                    }),
                    $("<label>", {
                        for: "isAcceptedLgpd",
                    }).html(textOptionAccept),
                ],
            }),
            $("<p>", {
                class: "col-2 form-check",
                html: [
                    $("<input>", {
                        change: function(event) {
                            var proms;

                            if (userProfileEmail) {
                                proms = getUserDataByUserEmail(
                                    userProfileEmail, ["id", "politica_privacidade"].concat(options_consent)
                                );
                            }
                            if (proms) {
                                proms.then(function(result) {
                                    userData = result.id;
                                    if (userData) {
                                        setUserDataByEmail(userProfileEmail, {
                                            overTwelveYears: event.target.checked,
                                        });
                                    } else {
                                        localStorage.setItem(
                                            "saveConsentLgpdWhenLogged",
                                            JSON.stringify({ overTwelveYears: event.target.checked })
                                        );
                                    }
                                });
                            }

                        },

                        type: "checkbox",
                        checked: overTwelveYears,
                        id: "overTwelveYears",
                    }),
                    $("<label>", {
                        for: "overTwelveYears",
                    }).html(textOptionAccept_years),
                ],
            }),

            $("<p>", {
                class: "col-2 form-check",
                html: [
                    $("<input>", {
                        change: function(event) {
                            var proms;

                            if (userProfileEmail) {
                                proms = getUserDataByUserEmail(
                                    userProfileEmail, ["id", "politica_privacidade"].concat(options_consent)
                                );
                            }
                            if (proms) {
                                proms.then(function(result) {
                                    userData = result.id;
                                    if (userData) {
                                        setUserDataByEmail(userProfileEmail, {
                                            marketingAccet: event.target.checked,
                                        });
                                    }
                                });
                            }

                        },
                        change: function(event) {
                            var proms;

                            if (userProfileEmail) {
                                proms = getUserDataByUserEmail(
                                    userProfileEmail, ["id", "politica_privacidade"].concat(options_consent)
                                );
                            }
                            if (proms) {
                                proms.then(function(result) {
                                    userData = result.id;
                                    if (userData) {
                                        setUserDataByEmail(userProfileEmail, {
                                            marketingAccet: event.target.checked,
                                        });
                                    }
                                });
                            }

                        },
                        type: "checkbox",
                        checked: marketingAccet,
                        id: "marketingAccet",
                    }),
                    $("<label>", {
                        for: "marketingAccet",
                    }).html(textOptionContacted),
                ],
            }),
        ];


        //   $newsletter.after($items_years);
        $newsletter.after($items);
        $newsletter.remove();
    }

    /**
     * Quando usuário se autenticar
     */
    var onUserLogged = setInterval(function() {
        var consentWhenLogged = localStorage.getItem("saveConsentWhenLogged");
        if (consentWhenLogged) {
            try {
                consentWhenLogged = JSON.parse(consentWhenLogged);
                if (consentWhenLogged && (userData || {}).id) {
                    setUserDataByEmail(userProfileEmail, consentWhenLogged).then(
                        function(response) {
                            if (response.status === 403) {
                                return;
                            }
                            console.info(
                                appName,
                                "Apagando localstorage saveConsentWhenLogged"
                            );
                            localStorage.removeItem("saveConsentWhenLogged");
                            clearInterval(onUserLogged);
                        }
                    );
                }
            } catch (e) {
                console.error(e);
            }
        }

        var consentLgpdWhenLogged = localStorage.getItem(
            "saveConsentLgpdWhenLogged"
        );
        if (consentLgpdWhenLogged) {
            try {
                consentLgpdWhenLogged = JSON.parse(consentLgpdWhenLogged);
                if (consentLgpdWhenLogged && (userData || {}).id) {
                    setUserDataByEmail(userProfileEmail, consentLgpdWhenLogged).then(
                        function(response) {
                            if (response.status === 403) {
                                return;
                            }
                            console.info(
                                appName,
                                "apagando localstorage saveConsentLgpdWhenLogged"
                            );
                            localStorage.removeItem("saveConsentLgpdWhenLogged");
                            clearInterval(onUserLogged);
                        }
                    );
                }
            } catch (e) {
                console.error(e);
            }
        }
    }, 3000);

    /**
     * Quando usuário desejar aceitar o modal de LGPD
     */
    var onSaveModalLgpdAccept = function() {
        var data = {
            politica_privacidade: true,
            overTwelveYears: true,
        };

        var proms;

        if (userProfileEmail) {
            proms = getUserDataByUserEmail(
                userProfileEmail, ["id", "politica_privacidade"].concat(options_consent)
            );
        }
        if (proms) {
            proms.then(function(result) {
                userData = result.id;
                if (userData) {
                    setUserDataByEmail(userProfileEmail, data).then(function() {
                        console.info(
                            appName,
                            "apagando localstorage saveConsentLgpdWhenLogged"
                        );
                        localStorage.removeItem("saveConsentLgpdWhenLogged");
                        clearInterval(onUserLogged);
                        userData.politica_privacidade = true;
                        userData.overTwelveYears = true;
                        $("#myModalAcceptLgdp").modal("hide");
                    });
                } else {
                    localStorage.setItem("saveConsentLgpdWhenLogged", JSON.stringify(data));
                }
            });
        }

    };

    /**
     * Quando usuário aceitar concentimento para opções de contato
     */
    var onSaveModalConsentAccept = function() {
        var data = {};
        var marketingAccet = false;

        for (var i = 0, l = options_consent.length; i < l; i = i + 1) {
            try {
                data[options_consent[i]] = $("#" + options_consent[i]).is(":checked");
                if (data[options_consent[i]]) {
                    marketingAccet = true;
                }
            } catch (e) {
                console.error(e);
            }
        }

        var proms;

        if (userProfileEmail) {
            proms = getUserDataByUserEmail(
                userProfileEmail, ["id", "politica_privacidade"].concat(options_consent)
            );
        }
        if (proms) {
            proms.then(function(result) {
                userData = result.id;
                if (userData) {
                    setUserDataByEmail(userProfileEmail, data).then(function() {
                        console.info(appName, "apagando localstorage saveConsentWhenLogged");
                        localStorage.removeItem("saveConsentWhenLogged");
                        clearInterval(onUserLogged);
                    });
                } else {
                    localStorage.setItem("saveConsentWhenLogged", JSON.stringify(data));
                }
            });
        }

        $("#marketingAccet").prop("checked", marketingAccet);
    };

    /**
     * Validar conteúdo com base na etapa que o cliente está navegando do checkout
     */
    var validateStep = debounce(function() {
        try {
            if (!(((window.API || {}).orderForm || {}).clientProfileData || {}).email) {
                return false;
            }

            if (
                (window.location.hash === "#/cart" ||
                    window.location.hash === "#/email") &&
                !userProfileEmail
            ) {
                return;
            }

            userProfileEmail = (
                ((window.API || {}).orderForm || {}).clientProfileData || {}
            ).email;

            if (lastSavedEmailData && lastSavedEmailData !== userProfileEmail) {
                // usuário trocou o email no meio do processo de compra no primeiro cadastro, depois de já ter salvo as informações no masterdata
                // então vamos seguir com o update para este novo email
                console.log(
                    appName,
                    "realizando update em novo usuário por causa de mudança de email pelo usuário"
                );
                loadUserData(lastSavedEmailData).then(function(result) {
                    try {
                        if (!(result || []).length || !result[0].id) {
                            return;
                        }
                        var data = result[0];
                        var dataToSave = Object.keys(data)
                            .filter(function(item) {
                                return options_consent.includes(item);
                            })
                            .reduce(function(stack, key) {
                                Object.assign(stack, {
                                    [key]: data[key]
                                });
                                return stack;
                            }, {});
                        setUserDataByEmail(userProfileEmail, dataToSave);
                        validateStep();
                    } catch (e) {
                        console.error(appName, e);
                    }
                });
                return;
            }

            var proms = loadUserData();

            if (proms) {
                proms.then(function(result) {
                    var data;

                    if ((result || []).length && result[0].id) {
                        data = result[0];
                    }

                    // se conseguiu chegar no checkout e mesmo assim ainda não conseguimos validar o user id
                    if (sessionStorage.getItem("inSharedCheckoutFlow")) {
                        return;
                    }

                    if (
                        window.location.hash === "#/payment" &&
                        userProfileEmail.indexOf("*") > -1
                    ) {
                        // se passou das etapas e ainda não tem email publico, forçar autenticação real
                        vtexid.start();
                        window.scrollTo(0, 0);
                        return;
                    }

                    if (
                        (window.location.hash === "#/payment" ||
                            window.location.hash === "#/shipping") &&
                        data &&
                        !data.politica_privacidade
                    ) {
                        $("#myModalAcceptLgdp").modal({
                            keyboard: false,
                            backdrop: "static",
                        });
                    } else {
                        var isAcceptedLgpd = true
                        var overTwelveYears = true
                        var marketingAccet = true
                        $("#isAcceptedLgpd").prop("checked", isAcceptedLgpd);
                        $("#overTwelveYears").prop("checked", overTwelveYears);
                        $("#marketingAccet").prop("checked", marketingAccet);
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    }, 700);

    /**
     * Start da aplicação
     */
    function init() {
        setInterval(showCustomOptinFields, 500);
        $(window).on("orderFormUpdated.vtex", validateStep);
        window.cart.items.subscribe(validateStep);
        $(window).on("hashchange", validateStep);
    }

    // quando DOM estiver pronto
    ready(function() {
        var scriptP = document.createElement("script");
        scriptP.src =
            "https://polyfill.io/v3/polyfill.min.js?features=fetch%2CString.prototype.startsWith";
        scriptP.onload = init;
        document.head.appendChild(scriptP);

        $("head").append(
            '<link href="/files/custom-lgpd-checkout.css?v=' +
            version +
            '" rel="stylesheet" />'
        );

        $("#myModal-termo-aceite").on("click", function() {
            onSaveModalConsentAccept();
        });
        $("#myModalAcceptLgdpAccept").on("click", function() {
            onSaveModalLgpdAccept();
        });
        $("#myModal-termo").on("hidden.bs.modal", function(e) {
            forceUpdateFromRegister();
        });
        $(document).on("click", ".vtexIdUI .modal-header .close", function(e) {
            if (
                window.location.hash === "#/payment" ||
                window.location.hash === "#/shipping"
            ) {
                window.location.hash = "#/profile";
            }
        });
        $("#myModalAcceptLgdp").on("hidden.bs.modal", function(e) {
            if (
                (window.location.hash === "#/payment" ||
                    window.location.hash === "#/shipping") &&
                !(userData || {}).politica_privacidade
            ) {
                window.location.hash = "#/cart";
            }
        });

        $("#overTwelveYears_modal").change(function() {
            if (this.checked) {
                var element = document.getElementById("col-btn-modal-accept");
                element.classList.remove("disable-modal-cta");
            } else {
                var element = document.getElementById("col-btn-modal-accept");
                element.classList.add("disable-modal-cta");
            }
        });

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
    });
})();
/**
 * *****************************
 * LGPD
 * *****************************
 */
//

/** 
 progress Bar
*/

function progressiveBar_getCookie(chave) {
    var chaveIgual = chave + "=";
    var pares = document.cookie.split(";");
    for (let i = 0; i < pares.length; i++) {
        var par = pares[i];
        while (par.charAt(0) == " ") {
            par = par.substring(1);
        }
        if (par.indexOf(chaveIgual) == 0) {
            return par.substring(chaveIgual.length);
        }
    }
    return "";
}

function progressiveBar_checkCookie() {

    var progressiveBar = this.progressiveBar_getCookie('progressiveBar');
    if (progressiveBar) {
        return true
    } else {
        return false
    }

}

function progressiveBar_create() {
    // Mudanças da label inicial
    const labelHeader = "APROVEITE NOSSO DESCONTO PROGRESSIVO"
    const subTitle = "MAIS PRODUTOS <b>MAIS DESCONTOS</b>"
    const paragraphText = "Adicione em seu carrinho produtos com <b>selo de Black Friday</b> e ganhe até <b>40% de desconto</b>"

    const listPercentage = [{
            "percentage": "0%",
            "itens": 0
        },

        {
            "percentage": "20%",
            "itens": 2
        },

        {
            "percentage": "30%",
            "itens": 3
        },

        {
            "percentage": "40%",
            "itens": 4
        }
    ]

    const tooltipBar = `Adicione mais ${listPercentage[1].itens} produtos com selo e ganhe 20% de Desconto!`

    // Criar LI customizada
    var listItens = ""

    for (var i = 0; listPercentage.length > i; i++) {
        listItens += `<li class="progressiveBar_popup--number ${i == 0 ? "progressiveBar_popup--number-active" : ""}" data-itens-value="${listPercentage[i].itens}"><span>${listPercentage[i].percentage}</span></li>`
    }

    // Cria o componente visual caso a APP esteja ativa
    $('body').append(`
        <div id="progressiveBar_popup" class="progressiveBar_popup progressiveBar_popup--closed">
            <div class="progressiveBar_popup--header">
                <h5>
                    <svg xmlns="http://www.w3.org/2000/svg" width="22.239" height="12.619" viewBox="0 0 22.239 12.619">
                        <g id="Icon_feather-arrow-up" data-name="Icon feather-arrow-up" transform="translate(-5.379 -6)">
                        <path id="Caminho_2" data-name="Caminho 2" d="M7.5,16.5l9-9,9,9" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/>
                        </g>
                    </svg>

                    ${labelHeader}
                </h5>
            </div>

            <div class="progressiveBar_popup--body">
                <h6>${subTitle}</h6>
                <p>${paragraphText}</p>

                <div class="progressiveBar_popup--bar">
                    <div>
                        <p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                                <g id="Grupo_1" data-name="Grupo 1" transform="translate(-1517 -988)">
                                    <g id="Elipse_4" data-name="Elipse 4" transform="translate(1517 988)" fill="none" stroke="#fff" stroke-width="1">
                                    <circle cx="9" cy="9" r="9" stroke="none"/>
                                    <circle cx="9" cy="9" r="8.5" fill="none"/>
                                    </g>
                                    <text id="_" data-name="!" transform="translate(1524 1001)" fill="#fff" font-size="11" font-family="Lato-Black, Lato" font-weight="800"><tspan x="0" y="0">!</tspan></text>
                                </g>
                            </svg>

                            ${tooltipBar}
                        </p>

                        <div class="progressiveBar_popup--arrow" style="margin-left: 1%;"></div>
                    </div>

                    <ul>
                        ${listItens}
                    </ul>

                    <strong style="background: linear-gradient(90deg, #5dff49 0%, #ddd 0%);"></strong>
                </div>
            </div>
        </div>
    `)

    $(".progressiveBar_popup--header").on("click", function() {
        if ($(".progressiveBar_popup").hasClass("progressiveBar_popup--closed")) {
            $(`.progressiveBar_popup`).removeClass("progressiveBar_popup--closed");
        } else {
            $(`.progressiveBar_popup`).addClass("progressiveBar_popup--closed");
        }
    });

    progressiveBar_popup();
}

function progressiveBar_cart() {
    // Função para tratar o carrinho antigo
    function oldCart(orderForm) {
        // Iniciar a leitura do carrinho antigo para migrar os dados
        const itens = orderForm.items

        if (itens.length > 0) {
            var checkItens = '';

            for (var i = 0; i < itens.length; i++) {
                // Checa por produto os dados de Clusters
                var url = `/api/catalog_system/pub/products/search/?fq=productId:${itens[i].productId}`

                $.ajax({
                    url: url,
                    type: "GET",
                    async: false,
                    success: function(data) {
                        const productClusters = JSON.stringify(data[0].productClusters)

                        // Caso exista o cluster criaremos um objeto com alguns dados de indentificação
                        if (productClusters.indexOf('Black Friday 2022') > -1) {
                            checkItens += `{"productId": "${data[0].productId}", "productName": "${data[0].productName}", "productReference": "${data[0].productReference}" },`
                            window.localStorage.setItem('progressiveCart', checkItens)
                        }
                    }
                })
            }

            // Checagem dos itens adicionados
            const itensControl = window.localStorage.getItem('progressiveCart') || null
            if (itensControl) {
                const cartProgressive = JSON.parse(`[${itensControl.substring(0, itensControl.length - 1)}]`)

                // Se algum dos produtos durante a leitura foi enquadrado no desconto progressivo carregamos a interface
                if (cartProgressive.length > 0) {
                    progressiveBar_popup()
                }
            }

        } else {
            return
        }
    }

    // Checar carrinho - Ao iniciar o APP de desconto progressivo, precisamos verificar se existe algum carrinho antigo sem leitura
    vtexjs.checkout.getOrderForm().done(function(orderForm) {
        const hasCart = window.localStorage.getItem('progressiveCart') || null

        if (!hasCart) {
            // É um antigo carrinho e precisa de tratamento
            oldCart(orderForm)
        }
    });
}

function progressiveBar_popup() {
    const hasCart = window.localStorage.getItem('progressiveCart') || null

    if (hasCart) {
        const itensControl = window.localStorage.getItem('progressiveCart') || null

        const cartProgressive = JSON.parse(`[${itensControl.substring(0, itensControl.length - 1)}]`)

        if (cartProgressive.length > 0) {
            // Carregar quantidade de itens ja sincronizados
            const itensCount = cartProgressive.length

            const stepsPercentage = document.querySelectorAll('.progressiveBar_popup--bar ul li')

            var checkSteps = ''

            stepsPercentage.forEach(function(item) {
                const stepValue = $(item).attr("data-itens-value")

                if (stepValue > itensCount) {
                    const step = {}
                    step.item = stepValue
                    step.status = false

                    checkSteps += `${JSON.stringify(step)},`
                } else {
                    const step = {}
                    step.item = stepValue
                    step.status = true

                    checkSteps += `${JSON.stringify(step)},`
                }
            });

            // Aplicar os efeitos visuais as etapas 
            const arraySteps = JSON.parse(`[${checkSteps.substring(0, checkSteps.length - 1)}]`)

            for (var i = 0; arraySteps.length > i; i++) {
                if (arraySteps[i].status == true) {
                    // Controles visuais 
                    var t = i + 1

                    var greyBar = 35 * t
                    var arrow = 32 * t

                    if (i == (arraySteps.length - 1)) {
                        greyBar = 35 * i
                        arrow = 32 * i
                    }

                    var next = ''

                    if (i == 0) {
                        var t = i + 1
                        next = arraySteps[t].item - 1
                    } else if (i == (arraySteps.length - 1)) {
                        next = 0
                    } else {
                        var t = i + 1
                        next = arraySteps[t].item - arraySteps[i].item
                    }

                    var plural

                    if (next > 1) {
                        plural = "produtos"
                    } else {
                        plural = "produto"
                    }

                    var tooltipBar = ``

                    if (i == (arraySteps.length - 1)) {
                        tooltipBar = `Quantidade necessária atingida!`
                    } else {
                        var t = i + 1
                        var stepPercentage = $(`.progressiveBar_popup--number[data-itens-value="${arraySteps[t].item}"] span`).html()
                        tooltipBar = `Adicione mais ${next} ${plural} com selo e ganhe ${stepPercentage} de Desconto!`
                        $(`.progressiveBar_popup--number[data-itens-value="${arraySteps[t].item}"] span`).css("border", `1px solid #000`);
                    }

                    $(".progressiveBar_popup--arrow").css("margin-left", `${arrow}%`);
                    $(".progressiveBar_popup--bar strong").css("background", `linear-gradient(90deg, #5dff49 ${greyBar}%, #ddd ${greyBar}%)`);
                    $(`.progressiveBar_popup--number[data-itens-value="${arraySteps[i].item}"]`).addClass("progressiveBar_popup--number-active");

                    $(".progressiveBar_popup--bar div p").html(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18">
                        <g id="Grupo_1" data-name="Grupo 1" transform="translate(-1517 -988)">
                            <g id="Elipse_4" data-name="Elipse 4" transform="translate(1517 988)" fill="none" stroke="#fff" stroke-width="1">
                            <circle cx="9" cy="9" r="9" stroke="none"/>
                            <circle cx="9" cy="9" r="8.5" fill="none"/>
                            </g>
                            <text id="_" data-name="!" transform="translate(1524 1001)" fill="#fff" font-size="11" font-family="Lato-Black, Lato" font-weight="800"><tspan x="0" y="0">!</tspan></text>
                        </g>
                    </svg>

                    ${tooltipBar}`)
                } else {
                    $(`.progressiveBar_popup--number[data-itens-value="${arraySteps[i].item}"]`).removeClass("progressiveBar_popup--number-active");
                }
            }

            let checkCookies = progressiveBar_checkCookie();

            if (!checkCookies) {
                $(`.progressiveBar_popup`).removeClass("progressiveBar_popup--closed");

                var d = new Date();
                d.setTime(d.getTime() + (minutes * 60 * 1000));
                var minutes = 40;
                var expires = "expires=" + d.toUTCString();
                document.cookie = "progressiveBar=carregado;" + expires + ";path=/";
            }

        }
    }
}


function addProduct(newProduct) {
    const ativarDemo = window.localStorage.getItem('progressiveCart--demo') || null

    if (ativarDemo == 'true') {
        // Checagem dos itens adicionados
        var url = `/api/catalog_system/pub/products/search/?fq=productId:${newProduct}`

        $.ajax({
            url: url,
            type: "GET",
            async: false,
            success: function(data) {
                const productClusters = JSON.stringify(data[0].productClusters)

                // Caso exista o cluster criaremos um objeto com alguns dados de indentificação
                if (productClusters.indexOf('Black Friday 2022') > -1) {
                    var checkItens = `{"productId": "${data[0].productId}", "productName": "${data[0].productName}", "productReference": "${data[0].productReference}" },`
                    const itensControl = window.localStorage.getItem('progressiveCart') || null

                    var newProductQuery = ''
                    if (itensControl) {
                        newProductQuery = itensControl + checkItens
                    } else {
                        newProductQuery = checkItens
                    }

                    window.localStorage.setItem('progressiveCart', newProductQuery)
                    const cartProgressive = JSON.parse(`[${newProductQuery.substring(0, newProductQuery.length - 1)}]`)

                    // Se algum dos produtos durante a leitura foi enquadrado no desconto progressivo carregamos a interface
                    if (cartProgressive.length > 0) {
                        progressiveBar_popup()
                        $(`.progressiveBar_popup`).removeClass("progressiveBar_popup--closed");
                    }
                }
            }
        })
    }
}

function isProductFlagBF() {
    vtexjs.checkout.getOrderForm()
        .done(function(orderForm) {

            var products = orderForm.items;
            var progressBarProduct = window.localStorage.getItem('progressiveCart') || null;
            if (progressBarProduct) {
                var cartProgressive = JSON.parse(`[${progressBarProduct.substring(0, progressBarProduct.length - 1)}]`)
                cartProgressive.forEach(element => {
                    console.log(element.productId);
                    var productIdd = element.productId
                    products.forEach(item => {
                        console.log('item:', item.productId)
                        if (item.productId == productIdd) {
                            $(`.product-item[data-sku="${item.id}"] .black-friday`).remove();
                            $(`tr.product-item[data-sku="${item.id}"]`).find('.product-name').append('<div class="black-friday"></div>')

                        }
                    })
                });
            }

        });
}


$(window).on("load", function() {
    var urlatual = window.location.href
    var re = new RegExp('cart')
    if (urlatual.match(re)) {
        progressiveBar_create()
        progressiveBar_cart()
        isProductFlagBF()



        $("body").on('click', '.item-link-remove', function() {
            window.localStorage.removeItem('progressiveCart');
            progressiveBar_cart()
        });
    } else {
        window.localStorage.removeItem('progressiveCart');
    }


});



/**
 * *****************************
 * ProgressBar
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