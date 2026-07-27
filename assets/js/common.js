$(document).ready(function () {
  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // Make Jekyll Scholar quote blocks navigate to the cited publication entry.
  $("blockquote:has(cite a.citation[href^='#'])").each(function () {
    const quoteBlock = $(this);
    const citationLink = quoteBlock.find("cite a.citation[href^='#']").first();
    const citationTarget = citationLink.attr("href");

    if (!citationTarget) {
      return;
    }

    const targetId = citationTarget.slice(1);
    const localTarget = targetId ? document.getElementById(targetId) : null;
    const targetHref = localTarget ? citationTarget : `/publications/${citationTarget}`;

    quoteBlock
      .addClass("publication-quote-link")
      .attr("role", "link")
      .attr("tabindex", "0")
      .attr("data-publication-href", targetHref)
      .on("click", function (event) {
        if ($(event.target).closest("a").length) {
          return;
        }
        window.location.href = targetHref;
      })
      .on("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          window.location.href = targetHref;
        }
      });

    if (!localTarget) {
      citationLink.attr("href", targetHref);
    }
  });

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });
});
