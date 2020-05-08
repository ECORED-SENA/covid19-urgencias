async function loadJSON(url) {
    const res = await fetch(url);
    return await res.json();
}

function renderHeaderAndBreadcrumb(titleHeader, breadcrumb) {
    document.getElementById('header__title').textContent = titleHeader;
    let breadcrumbContent = document.getElementById('header__breadcrumb__content');
    let htmlBreadcrumb = "";
    breadcrumbContent.innerHTML = "";
    breadcrumb.forEach(function(span) { htmlBreadcrumb += '<span><i class="icon chevron"></i></span><span class="px-1">' + span + '</span>'; });
    breadcrumbContent.insertAdjacentHTML('beforeend', htmlBreadcrumb);
}

function renderContent(slug, anchor) {
    let item = sessionStorage.getItem(slug);
    $("body").loader('show');
    if (item) {
        contentObject = JSON.parse(item);
        renderHeaderAndBreadcrumb(contentObject.title, contentObject.breadcrumb);
        if (contentObject.path.length > 0) {
            if ($('video').length > 0) {
                $('video').each(function() {
                    this.pause();
                    this.src = '';
                    this.currentSrc = '';
                });
            }
            fetch(contentObject.path).then(res => { return res.text(); })
                .then(data => {
                    document.getElementById('mainContent').innerHTML = data;
                    if (anchor != undefined && anchor.length > 0) { $('body,html').stop(true, true).animate({ scrollTop: $('#' + anchor).offset().top }, 1000); } else { $('body,html').stop(true, true).animate({ scrollTop: 0 }, 1000); }
                });
            $("body").loader('hide');
        } else {
            document.getElementsByClassName('verticalNavbar__navLink')[0].click();
            console.log("path no declarado");
        }
    } else {
        document.getElementsByClassName('verticalNavbar__navLink')[0].click();
        console.log("Slug no encontrado, revisar carpeta de contenido o json de configuración.");
    }

}

var menuMain = "";

function createMenu(navBar) {
    navBar.forEach(function(button) {
        sessionStorage.setItem(button.slug, JSON.stringify(button));
        let idTag = '';
        let dataAnchor = '';
        var selectClass = 'verticalNavbar__menuMain';
        if (button.id != undefined && button.id.length > 0) { idTag = button.id }
        if (button.anchor != undefined && button.anchor.length > 0) {
            selectClass = 'routerAnchor';
            dataAnchor = 'data-anchor="' + button.anchor + '"';
        }
        menuMain = menuMain + '<li class="nav-item"><a id="' + idTag + '" class="verticalNavbar__navLink nav-link ' + selectClass + ' transition" data-route="' + button.slug + '" ' + dataAnchor + '><span class="col-11 d-inline-block">' + button.title + '</span><span class="p-0 col-1 d-inline-block icon-content text-center"><i class="icon ' + button.icon + ' mx-auto"></i></span></a></li>';
        if (button.submenu && button.submenu.length != 0) {
            menuMain = menuMain + '<ul class="submenu">';
            createMenu(button.submenu)
            menuMain = menuMain + '</ul>';
        }
    });
}

function renderNavbar(data) {
    let verticalNavbar = document.getElementById("verticalNavbar__sidebar");
    createMenu(data);
    verticalNavbar.insertAdjacentHTML('beforeend', menuMain);
    let verticalNavbarMain = document.getElementsByClassName('verticalNavbar__menuMain');
    Array.from(verticalNavbarMain).forEach(function(button) {
        button.addEventListener('click', function() {
            let route = button.getAttribute("data-route");
            $.routes.find('path').routeTo({ slug: route });
            document.getElementById("verticalNavbar__title").classList.add("verticalNavbar__title-active");
            document.getElementsByClassName('verticalNavbar__link-active')[0].classList.remove('verticalNavbar__link-active');
            button.classList.add("verticalNavbar__link-active");
            if ($(window).width() < 720) { $(".navbar-toggler").click(); }
        });
    });
    let verticalNavbarAnchor = document.getElementsByClassName('routerAnchor');
    Array.from(verticalNavbarAnchor).forEach(function(button) {
        button.addEventListener('click', function() {
            let route = button.getAttribute("data-route");
            let anchor = button.getAttribute("data-anchor");
            $.routes.find('anchor').routeTo({ slug: route, anchor: anchor });
            document.getElementById("verticalNavbar__title").classList.add("verticalNavbar__title-active");
            document.getElementsByClassName('verticalNavbar__link-active')[0].classList.remove('verticalNavbar__link-active');
            button.classList.add("verticalNavbar__link-active");
            if ($(window).width() < 720) { $(".navbar-toggler").click(); }
        });
    });
}

function renderNavbarExtras(navBar) {
    let verticalNavbar = document.getElementById("verticalNavbar__extra");
    navBar.forEach(function(button, i) {
        sessionStorage.setItem(button.slug, JSON.stringify(button));
        let htmlExtra;
        if (button.slug == "external" || button.slug == "externo" || button.slug == "pdf") { htmlExtra = '<li class="nav-item"><a class="verticalNavbar__navLink nav-link verticalNavbar__menuExtra transition" href="' + button.path + '" target="_blank"><span><i class="icon ' + button.icon + '"></i></span>' + button.title + '</a></li>'; } else { htmlExtra = '<li class="nav-item"><a class="verticalNavbar__navLink nav-link verticalNavbar__menuExtra transition" data-route="' + button.slug + '"><span><i class="icon ' + button.icon + '"></i></span>' + button.title + '</a></li>'; }
        verticalNavbar.insertAdjacentHTML('beforeend', htmlExtra);
        document.getElementsByClassName('verticalNavbar__menuExtra')[i].addEventListener('click', function() {
            $.routes.find('path').routeTo({ slug: this.getAttribute("data-route") });
            if ($(window).width() < 720) { $(".navbar-toggler").click(); }
            document.getElementById("verticalNavbar__title").classList.remove("verticalNavbar__title-active");
            document.getElementsByClassName('verticalNavbar__link-active')[0].classList.remove('verticalNavbar__link-active');
            this.classList.add("verticalNavbar__link-active");
        });
    });
    document.getElementById("verticalNavbar__sidebar").style.maxHeight = (window.innerHeight - ($('#verticalNavbar__extra .nav-item')[0].offsetHeight * navBar.length)) + "px";
}

async function renderGlossary(slug) {
    let item = sessionStorage.getItem(slug);
    contentObject = JSON.parse(item);
    renderHeaderAndBreadcrumb(contentObject.title, contentObject.breadcrumb);
    let mainContent = document.getElementById('mainContent');
    mainContent.textContent = "";
    $("body").loader('show');
    await loadJSON(contentObject.path).then(data => {
        let htmlGlossary = '<div id="row" class="content"><div class="col-md-10 mx-auto">';
        data.forEach(function(letter) {
            htmlGlossary += '<table class="glossary"><thead><tr><th scope="col">' + letter.letter + '</th></tr></thead><tbody>';
            letter.terms.forEach(function(term) { htmlGlossary += '<tr><td class="title">' + term.title + '</td><td>' + term.desciption + '</td></tr>'; });
            htmlGlossary += '</tbody><table>';
        });
        htmlGlossary += '</div></div>';
        mainContent.innerHTML = htmlGlossary;
    }).then(function() { $("body").loader('hide'); });
}

function renderConfig(data) {
    document.getElementById('header__titleProgram').textContent = data.programName;
    document.getElementById('verticalNavbar__title__text').textContent = data.menuTitle;
    document.title = data.pageTitle;
}

function renderCredits(data) {
    let footer = document.getElementById("footer__credits");
    data.forEach(function(row) {
        let htmlCredit = '<p class="footer__credits__title col-sm-12">' + row.department + '</p><div class="col-sm-12 col-md-6">';
        row.left.forEach(function(person, i) { htmlCredit += '<p class="footer__credits__title">' + person.title + '</p><p class="footer__credits__name">' + person.name + '</p>'; });
        htmlCredit += '</div><div class="col-sm-12 col-md-6">'
        row.right.forEach(function(person, i) { htmlCredit += '<p class="footer__credits__title">' + person.title + '</p><p class="footer__credits__name">' + person.name + '</p>'; });
        htmlCredit += '</div>';
        footer.insertAdjacentHTML('beforeend', htmlCredit);
    });
}

async function renderInitialContent() {
    let navItems = Array.from(document.getElementsByClassName('verticalNavbar__navLink'));
    if (!(window.location.hash[window.location.hash.length - 1] == '/')) { window.location.hash = window.location.hash + '/'; }
    if (window.location.hash.length > 2) {
        baseRoutesLength = baseRoutes.length + 2; // length plus # and /
        slug = window.location.hash.substr(baseRoutesLength, window.location.hash.length - (baseRoutesLength + 1));
        let index = navItems.findIndex((element) => element.getAttribute("data-route") == slug);
        if (index != -1) {
            navItems[index].click();
            if (this.slug == "glosario" || this.slug == "glossary") { renderGlossary(slug); } else { renderContent(slug); }
        } else {
            navItems[0].click();
            console.log("Render initial: Contenido del hash no encontrado, json de configuración.");
        }
    } else { navItems[0].click(); }
}

document.addEventListener("DOMContentLoaded", async function() {
    $("body").loader('show');
    await loadJSON('config/global.json').then(data => { renderConfig(data); });
    await loadJSON('config/menuMain.json').then(data => { renderNavbar(data); });
    await loadJSON('config/menuSecondary.json').then(data => { if (data.length > 0) { renderNavbarExtras(data); } });
    //await loadJSON('config/credits.json').then(data => { renderCredits(data); });
    renderInitialContent();
    $("body").loader('hide');
});


$(document).ready(() => {
  $('.navbar-toggler').click(() => {
    $('#verticalNavbar__extra').collapse('toggle');
    $('#navbar')
      .toggleClass('col-md-8')
      .toggleClass('col-lg-9')
      .toggleClass('col-md-12');
    $('#contentCollapse')
      .toggleClass('col-md-8')
      .toggleClass('col-lg-9')
      .toggleClass('col-md-12');
  });
});


$(function () {
  $('[data-toggle="popover"]').popover()
})

