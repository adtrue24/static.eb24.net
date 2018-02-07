! function(a) {
    "use strict";
    "function" == typeof define && define.amd ? define(["jquery"], a) : a("object" == typeof exports && "function" == typeof require ? require("jquery") : jQuery)
}(function(a) {
    "use strict";

    function b(c, d) {
        var e = function() {},
            f = this,
            g = {
                ajaxSettings: {},
                autoSelectFirst: !1,
                appendTo: document.body,
                serviceUrl: null,
                lookup: null,
                onSelect: null,
                width: "auto",
                minChars: 1,
                maxHeight: 300,
                deferRequestBy: 0,
                params: {},
                formatResult: b.formatResult,
                delimiter: null,
                zIndex: 9999,
                type: "GET",
                noCache: !1,
                onSearchStart: e,
                onSearchComplete: e,
                onSearchError: e,
                preserveInput: !1,
                containerClass: "autocomplete-suggestions",
                tabDisabled: !1,
                dataType: "text",
                currentRequest: null,
                triggerSelectOnValidInput: !0,
                preventBadQueries: !0,
                lookupFilter: function(a, b, c) {
                    return -1 !== a.value.toLowerCase().indexOf(c)
                },
                paramName: "query",
                transformResult: function(b) {
                    return "string" == typeof b ? a.parseJSON(b) : b
                },
                showNoSuggestionNotice: !1,
                noSuggestionNotice: "No results",
                orientation: "bottom",
                forceFixPosition: !1
            };
        f.element = c, f.el = a(c), f.suggestions = [], f.badQueries = [], f.selectedIndex = -1, f.currentValue = f.element.value, f.intervalId = 0, f.cachedResponse = {}, f.onChangeInterval = null, f.onChange = null, f.isLocal = !1, f.suggestionsContainer = null, f.noSuggestionsContainer = null, f.options = a.extend({}, g, d), f.classes = {
            selected: "autocomplete-selected",
            suggestion: "autocomplete-suggestion"
        }, f.hint = null, f.hintValue = "", f.selection = null, f.initialize(), f.setOptions(d)
    }
    var c = function() {
            return {
                escapeRegExChars: function(a) {
                    return a.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
                },
                createNode: function(a) {
                    var b = document.createElement("div");
                    return b.className = a, b.style.position = "absolute", b.style.display = "none", b
                }
            }
        }(),
        d = {
            ESC: 27,
            TAB: 9,
            RETURN: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        };
    b.utils = c, a.Autocomplete = b, b.formatResult = function(a, b) {
        if (!b) return a.value;
        var d = "(" + c.escapeRegExChars(b) + ")";
        return a.value.replace(new RegExp(d, "gi"), "<strong>$1</strong>").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/&lt;(\/?strong)&gt;/g, "<$1>")
    }, b.prototype = {
        killerFn: null,
        initialize: function() {
            var c, d = this,
                e = "." + d.classes.suggestion,
                f = d.classes.selected,
                g = d.options;
            d.element.setAttribute("autocomplete", "off"), d.killerFn = function(b) {
                0 === a(b.target).closest("." + d.options.containerClass).length && (d.killSuggestions(), d.disableKillerFn())
            }, d.noSuggestionsContainer = a('<div class="autocomplete-no-suggestion"></div>').html(this.options.noSuggestionNotice).get(0), d.suggestionsContainer = b.utils.createNode(g.containerClass), c = a(d.suggestionsContainer), c.appendTo(g.appendTo), "auto" !== g.width && c.width(g.width), c.on("mouseover.autocomplete", e, function() {
                d.activate(a(this).data("index"))
            }), c.on("mouseout.autocomplete", function() {
                d.selectedIndex = -1, c.children("." + f).removeClass(f)
            }), c.on("click.autocomplete", e, function() {
                return d.select(a(this).data("index")), !1
            }), d.fixPositionCapture = function() {
                d.visible && d.fixPosition()
            }, a(window).on("resize.autocomplete", d.fixPositionCapture), d.el.on("keydown.autocomplete", function(a) {
                d.onKeyPress(a)
            }), d.el.on("keyup.autocomplete", function(a) {
                d.onKeyUp(a)
            }), d.el.on("blur.autocomplete", function() {
                d.onBlur()
            }), d.el.on("focus.autocomplete", function() {
                d.onFocus()
            }), d.el.on("change.autocomplete", function(a) {
                d.onKeyUp(a)
            }), d.el.on("input.autocomplete", function(a) {
                d.onKeyUp(a)
            })
        },
        onFocus: function() {
            var a = this;
            a.fixPosition(), a.el.val().length >= a.options.minChars && a.onValueChange()
        },
        onBlur: function() {
            this.enableKillerFn()
        },
        abortAjax: function() {
            var a = this;
            a.currentRequest && (a.currentRequest.abort(), a.currentRequest = null)
        },
        setOptions: function(b) {
            var c = this,
                d = c.options;
            a.extend(d, b), c.isLocal = a.isArray(d.lookup), c.isLocal && (d.lookup = c.verifySuggestionsFormat(d.lookup)), d.orientation = c.validateOrientation(d.orientation, "bottom"), a(c.suggestionsContainer).css({
                "max-height": d.maxHeight + "px",
                width: d.width + "px",
                "z-index": d.zIndex
            })
        },
        clearCache: function() {
            this.cachedResponse = {}, this.badQueries = []
        },
        clear: function() {
            this.clearCache(), this.currentValue = "", this.suggestions = []
        },
        disable: function() {
            var a = this;
            a.disabled = !0, clearInterval(a.onChangeInterval), a.abortAjax()
        },
        enable: function() {
            this.disabled = !1
        },
        fixPosition: function() {
            var b = this,
                c = a(b.suggestionsContainer),
                d = c.parent().get(0);
            if (d === document.body || b.options.forceFixPosition) {
                var e = b.options.orientation,
                    f = c.outerHeight(),
                    g = b.el.outerHeight(),
                    h = b.el.offset(),
                    i = {
                        top: h.top,
                        left: h.left
                    };
                if ("auto" === e) {
                    var j = a(window).height(),
                        k = a(window).scrollTop(),
                        l = -k + h.top - f,
                        m = k + j - (h.top + g + f);
                    e = Math.max(l, m) === l ? "top" : "bottom"
                }
                if ("top" === e ? i.top += -f : i.top += g, d !== document.body) {
                    var n, o = c.css("opacity");
                    b.visible || c.css("opacity", 0).show(), n = c.offsetParent().offset(), i.top -= n.top, i.left -= n.left, b.visible || c.css("opacity", o).hide()
                }
                "auto" === b.options.width && (i.width = b.el.outerWidth() - 2 + "px"), c.css(i)
            }
        },
        enableKillerFn: function() {
            var b = this;
            a(document).on("click.autocomplete", b.killerFn)
        },
        disableKillerFn: function() {
            var b = this;
            a(document).off("click.autocomplete", b.killerFn)
        },
        killSuggestions: function() {
            var a = this;
            a.stopKillSuggestions(), a.intervalId = window.setInterval(function() {
                a.visible && (a.el.val(a.currentValue), a.hide()), a.stopKillSuggestions()
            }, 50)
        },
        stopKillSuggestions: function() {
            window.clearInterval(this.intervalId)
        },
        isCursorAtEnd: function() {
            var a, b = this,
                c = b.el.val().length,
                d = b.element.selectionStart;
            return "number" == typeof d ? d === c : document.selection ? (a = document.selection.createRange(), a.moveStart("character", -c), c === a.text.length) : !0
        },
        onKeyPress: function(a) {
            var b = this;
            if (!b.disabled && !b.visible && a.which === d.DOWN && b.currentValue) return void b.suggest();
            if (!b.disabled && b.visible) {
                switch (a.which) {
                    case d.ESC:
                        b.el.val(b.currentValue), b.hide();
                        break;
                    case d.RIGHT:
                        if (b.hint && b.options.onHint && b.isCursorAtEnd()) {
                            b.selectHint();
                            break
                        }
                        return;
                    case d.TAB:
                        if (b.hint && b.options.onHint) return void b.selectHint();
                        if (-1 === b.selectedIndex) return void b.hide();
                        if (b.select(b.selectedIndex), b.options.tabDisabled === !1) return;
                        break;
                    case d.RETURN:
                        if (-1 === b.selectedIndex) return void b.hide();
                        b.select(b.selectedIndex);
                        break;
                    case d.UP:
                        b.moveUp();
                        break;
                    case d.DOWN:
                        b.moveDown();
                        break;
                    default:
                        return
                }
                a.stopImmediatePropagation(), a.preventDefault()
            }
        },
        onKeyUp: function(a) {
            var b = this;
            if (!b.disabled) {
                switch (a.which) {
                    case d.UP:
                    case d.DOWN:
                        return
                }
                clearInterval(b.onChangeInterval), b.currentValue !== b.el.val() && (b.findBestHint(), b.options.deferRequestBy > 0 ? b.onChangeInterval = setInterval(function() {
                    b.onValueChange()
                }, b.options.deferRequestBy) : b.onValueChange())
            }
        },
        onValueChange: function() {
            var b = this,
                c = b.options,
                d = b.el.val(),
                e = b.getQuery(d);
            return b.selection && b.currentValue !== e && (b.selection = null, (c.onInvalidateSelection || a.noop).call(b.element)), clearInterval(b.onChangeInterval), b.currentValue = d, b.selectedIndex = -1, c.triggerSelectOnValidInput && b.isExactMatch(e) ? void b.select(0) : void(e.length < c.minChars ? b.hide() : b.getSuggestions(e))
        },
        isExactMatch: function(a) {
            var b = this.suggestions;
            return 1 === b.length && b[0].value.toLowerCase() === a.toLowerCase()
        },
        getQuery: function(b) {
            var c, d = this.options.delimiter;
            return d ? (c = b.split(d), a.trim(c[c.length - 1])) : b
        },
        getSuggestionsLocal: function(b) {
            var c, d = this,
                e = d.options,
                f = b.toLowerCase(),
                g = e.lookupFilter,
                h = parseInt(e.lookupLimit, 10);
            return c = {
                suggestions: a.grep(e.lookup, function(a) {
                    return g(a, b, f)
                })
            }, h && c.suggestions.length > h && (c.suggestions = c.suggestions.slice(0, h)), c
        },
        getSuggestions: function(b) {
            var c, d, e, f, g = this,
                h = g.options,
                i = h.serviceUrl;
            if (h.params[h.paramName] = b, d = h.ignoreParams ? null : h.params, h.onSearchStart.call(g.element, h.params) !== !1) {
                if (a.isFunction(h.lookup)) return void h.lookup(b, function(a) {
                    g.suggestions = a.suggestions, g.suggest(), h.onSearchComplete.call(g.element, b, a.suggestions)
                });
                g.isLocal ? c = g.getSuggestionsLocal(b) : (a.isFunction(i) && (i = i.call(g.element, b)), e = i + "?" + a.param(d || {}), c = g.cachedResponse[e]), c && a.isArray(c.suggestions) ? (g.suggestions = c.suggestions, g.suggest(), h.onSearchComplete.call(g.element, b, c.suggestions)) : g.isBadQuery(b) ? h.onSearchComplete.call(g.element, b, []) : (g.abortAjax(), f = {
                    url: i,
                    data: d,
                    type: h.type,
                    dataType: h.dataType
                }, a.extend(f, h.ajaxSettings), g.currentRequest = a.ajax(f).done(function(a) {
                    var c;
                    g.currentRequest = null, c = h.transformResult(a, b), g.processResponse(c, b, e), h.onSearchComplete.call(g.element, b, c.suggestions)
                }).fail(function(a, c, d) {
                    h.onSearchError.call(g.element, b, a, c, d)
                }))
            }
        },
        isBadQuery: function(a) {
            if (!this.options.preventBadQueries) return !1;
            for (var b = this.badQueries, c = b.length; c--;)
                if (0 === a.indexOf(b[c])) return !0;
            return !1
        },
        hide: function() {
            var b = this,
                c = a(b.suggestionsContainer);
            a.isFunction(b.options.onHide) && b.visible && b.options.onHide.call(b.element, c), b.visible = !1, b.selectedIndex = -1, clearInterval(b.onChangeInterval), a(b.suggestionsContainer).hide(), b.signalHint(null)
        },
        suggest: function() {
            if (0 === this.suggestions.length) return void(this.options.showNoSuggestionNotice ? this.noSuggestions() : this.hide());
            var b, c = this,
                d = c.options,
                e = d.groupBy,
                f = d.formatResult,
                g = c.getQuery(c.currentValue),
                h = c.classes.suggestion,
                i = c.classes.selected,
                j = a(c.suggestionsContainer),
                k = a(c.noSuggestionsContainer),
                l = d.beforeRender,
                m = "",
                n = function(a, c) {
                    var d = a.data[e];
                    return b === d ? "" : (b = d, '<div class="autocomplete-group"><strong>' + b + "</strong></div>")
                };
            return d.triggerSelectOnValidInput && c.isExactMatch(g) ? void c.select(0) : (a.each(c.suggestions, function(a, b) {
                e && (m += n(b, g, a)), m += '<div class="' + h + '" data-index="' + a + '">' + f(b, g, a) + "</div>"
            }), this.adjustContainerWidth(), k.detach(), j.html(m), a.isFunction(l) && l.call(c.element, j, c.suggestions), c.fixPosition(), j.show(), d.autoSelectFirst && (c.selectedIndex = 0, j.scrollTop(0), j.children("." + h).first().addClass(i)), c.visible = !0, void c.findBestHint())
        },
        noSuggestions: function() {
            var b = this,
                c = a(b.suggestionsContainer),
                d = a(b.noSuggestionsContainer);
            this.adjustContainerWidth(), d.detach(), c.empty(), c.append(d), b.fixPosition(), c.show(), b.visible = !0
        },
        adjustContainerWidth: function() {
            var b, c = this,
                d = c.options,
                e = a(c.suggestionsContainer);
            "auto" === d.width && (b = c.el.outerWidth() - 2, e.width(b > 0 ? b : 300))
        },
        findBestHint: function() {
            var b = this,
                c = b.el.val().toLowerCase(),
                d = null;
            c && (a.each(b.suggestions, function(a, b) {
                var e = 0 === b.value.toLowerCase().indexOf(c);
                return e && (d = b), !e
            }), b.signalHint(d))
        },
        signalHint: function(b) {
            var c = "",
                d = this;
            b && (c = d.currentValue + b.value.substr(d.currentValue.length)), d.hintValue !== c && (d.hintValue = c, d.hint = b, (this.options.onHint || a.noop)(c))
        },
        verifySuggestionsFormat: function(b) {
            return b.length && "string" == typeof b[0] ? a.map(b, function(a) {
                return {
                    value: a,
                    data: null
                }
            }) : b
        },
        validateOrientation: function(b, c) {
            return b = a.trim(b || "").toLowerCase(), -1 === a.inArray(b, ["auto", "bottom", "top"]) && (b = c), b
        },
        processResponse: function(a, b, c) {
            var d = this,
                e = d.options;
            a.suggestions = d.verifySuggestionsFormat(a.suggestions), e.noCache || (d.cachedResponse[c] = a, e.preventBadQueries && 0 === a.suggestions.length && d.badQueries.push(b)), b === d.getQuery(d.currentValue) && (d.suggestions = a.suggestions, d.suggest())
        },
        activate: function(b) {
            var c, d = this,
                e = d.classes.selected,
                f = a(d.suggestionsContainer),
                g = f.find("." + d.classes.suggestion);
            return f.find("." + e).removeClass(e), d.selectedIndex = b, -1 !== d.selectedIndex && g.length > d.selectedIndex ? (c = g.get(d.selectedIndex), a(c).addClass(e), c) : null
        },
        selectHint: function() {
            var b = this,
                c = a.inArray(b.hint, b.suggestions);
            b.select(c)
        },
        select: function(a) {
            var b = this;
            b.hide(), b.onSelect(a)
        },
        moveUp: function() {
            var b = this;
            if (-1 !== b.selectedIndex) return 0 === b.selectedIndex ? (a(b.suggestionsContainer).children().first().removeClass(b.classes.selected), b.selectedIndex = -1, b.el.val(b.currentValue), void b.findBestHint()) : void b.adjustScroll(b.selectedIndex - 1)
        },
        moveDown: function() {
            var a = this;
            a.selectedIndex !== a.suggestions.length - 1 && a.adjustScroll(a.selectedIndex + 1)
        },
        adjustScroll: function(b) {
            var c = this,
                d = c.activate(b);
            if (d) {
                var e, f, g, h = a(d).outerHeight();
                e = d.offsetTop, f = a(c.suggestionsContainer).scrollTop(), g = f + c.options.maxHeight - h, f > e ? a(c.suggestionsContainer).scrollTop(e) : e > g && a(c.suggestionsContainer).scrollTop(e - c.options.maxHeight + h), c.options.preserveInput || c.el.val(c.getValue(c.suggestions[b].value)), c.signalHint(null)
            }
        },
        onSelect: function(b) {
            var c = this,
                d = c.options.onSelect,
                e = c.suggestions[b];
            c.currentValue = c.getValue(e.value), c.currentValue === c.el.val() || c.options.preserveInput || c.el.val(c.currentValue), c.signalHint(null), c.suggestions = [], c.selection = e, a.isFunction(d) && d.call(c.element, e)
        },
        getValue: function(a) {
            var b, c, d = this,
                e = d.options.delimiter;
            return e ? (b = d.currentValue, c = b.split(e), 1 === c.length ? a : b.substr(0, b.length - c[c.length - 1].length) + a) : a
        },
        dispose: function() {
            var b = this;
            b.el.off(".autocomplete").removeData("autocomplete"), b.disableKillerFn(), a(window).off("resize.autocomplete", b.fixPositionCapture), a(b.suggestionsContainer).remove()
        }
    }, a.fn.autocomplete = a.fn.devbridgeAutocomplete = function(c, d) {
        var e = "autocomplete";
        return 0 === arguments.length ? this.first().data(e) : this.each(function() {
            var f = a(this),
                g = f.data(e);
            "string" == typeof c ? g && "function" == typeof g[c] && g[c](d) : (g && g.dispose && g.dispose(), g = new b(this, c), f.data(e, g))
        })
    }
});
$(document).ready(function() {
    function c() {
        var w = this;
        w.IN = function() {
            var x = ((x = document.referrer.match(/^http:\/\/(?:www\.)?([a-z0-9\-\.]+)(?:\d+)?/)) && typeof x !== "undefined" && x[1]) || "";
            var y = {
                ref: document.referrer
            };
            if (window.location.href && (d = window.location.href.match(/\?f(\d+)/)) && d[1]) {
                y.f = d[1]
            }
            if (!x || !document.domain || document.domain.indexOf(x) == -1) {

            }
        }
    }
    window.trade = new c();
    window.trade.IN();
    $("body").append('<div id="back_to_top"><a href="#" id="back-to-top"><img src="'+BASE_URL_CDN+'images/btt.png"></a></div>');
    $("#back_to_top").hide();
    $(function() {
        $(window).scroll(function() {
            if ($(this).scrollTop() > 1000) {
                $("#back_to_top").fadeIn()
            } else {
                $("#back_to_top").fadeOut()
            }
        });
        $("#back_to_top a").click(function() {
            $("body,html").scrollTop(300).animate({
                scrollTop: 0
            }, 200);
            return false
        })
    });
    var m = function() {
        $("#lngselect").removeClass("down");
        $("#lnglist").hide(0, function() {
            $("body").unbind("click", m)
        })
    };
    $("#lngselect").click(function() {
        $("#lnglist").fadeIn(10, function() {
            $("#lngselect").addClass("down");
            $("#lnglist").scrollTop(0);
            $("#lnglist a").click(function() {
                $.cookie("selLang", $(this).attr("class"), {
                    expires: 365,
                    path: "/"
                })
            });
            $("body").bind("click", m)
        })
    });



    var l = {};
    var o = {};
    var e = {};
    var j = [];
    var s = [];
    var q = [];
    var a = 0;
    var h = 10000;
    var f = false;
    if ("localStorage" in window && window.localStorage !== null) {
        f = true
    }
    var p = null;
    var r = null;
    var n = null;
    r_click = function(x, y) {
        var w = new Date();
        if (p != null && r != null && n != null) {
            if ((w.getTime() - n) > h && (typeof o[p] != "undefined")) {
                l[p] = 1
            }
            if (typeof r != "undefined") {
                j[j.length] = r;
                if ((w.getTime() - n) > 60000 && (typeof o[p] != "undefined")) {
                    s[s.length] = r
                }
            }
        }
        p = x;
        r = y;
        n = w.getTime()
    };
    r_init = function() {
        $("[data-id]").each(function() {
            e[$(this).data("id")] = new Array($(this).children("img:first").height(), $(this).offset().top, $(this).data("sid"));
            //$(this).parent().append('<a href="http://report.webclicks24.com/?id=' + $(this).data("id") + '" class="report" target="_blank"></a>')
        });

        $("[data-id]").click(function(w) {
            r_click($(this).data("id"), $(this).data("sid"))
        })
    };
    r_resize = function() {
        v = null;
        $("[data-id]").each(function() {
            if (typeof e[$(this).data("id")] !== "undefined") {
                e[$(this).data("id")] = new Array($(this).children("img:first").height(), $(this).offset().top, $(this).data("sid"))
            }
        });
        r_scroll()
    };
    r_scroll = function() {
        r_click(null, null);
        v = null;
        var x = $(window).scrollTop();
        var y = x + $(window).height();
        for (var w in e) {
            if (x <= e[w][1] + 0.1 * e[w][0] && e[w][1] + 0.6 * e[w][0] < y) {
                if (typeof o[w] == "undefined") {
                    q[q.length] = e[w][2]
                }
                o[w] = 1
            }
        }
    };

    r_init();
    var v = window.setTimeout(r_scroll, 1000);
    $(window).scroll(function() {
        if (v) {
            window.clearTimeout(v)
        }
        v = window.setTimeout(r_scroll, 400);
        a = 1
    });
    $(window).resize(function() {
        if (v) {
            window.clearTimeout(v)
        }
        v = window.setTimeout(r_resize, 400)
    });
    if (/iphone|ipod|ipad/.test(window.navigator.userAgent.toLowerCase())) {
        $(window).on("pagehide", function() {
            r_click(null, null);

        })
    } else {
        $(window).on("beforeunload", function() {
            r_click(null, null);

        })
    }
    $("h3.title").hover(function() {
        $(this).toggleClass("full")
    }, function() {
        $(this).toggleClass("full")
    });
    if (typeof $("#showMore") !== "undefined") {
        var i = '<div id="loading"><img src="'+BASE_URL_CDN+'images/ajax-loader.gif" /></div>';
        var k = new Image();
        k.src = BASE_URL_CDN + "images/ajax-loader.gif";
        var g = false;
        var u = 1;
        var t = $("#content").data("max");
        var b = $("#content").data("url");
        if (u >= t) {
            $("#showMore").hide()
        } else {
            $("#showMore").click(function() {
                if (u < t && !g) {
                    g = true;
                    r_click(null, null);

                    e = {};
                    l = {};
                    o = {};
                    j = [];
                    s = [];
                    q = [];
                    jQuery.ajax({
                        url: b.replace("_PAGE_", u + 1),
                        async: true,
                        beforeSend: function() {
                            $("#content").append(i)
                        },
                        success: function(w) {
                            $("#content").append('<div id="section' + (u + 1) + '" style="clear:both;">' + w + "</div>");
                            $("#section" + (u + 1) + " img.lazy").lazyload({
                                threshold: 600
                            });
                            $("#section" + (u + 1) + " h3.title").hover(function() {
                                $(this).toggleClass("full")
                            }, function() {
                                $(this).toggleClass("full")
                            });
                            $("#section" + (u + 1) + " [data-id]").each(function() {
                                e[$(this).data("id")] = new Array($(this).children("img:first").height(), $(this).offset().top, $(this).data("sid"));

                            });
                            $("#section" + (u + 1) + " a.report").click(function() {
                                //show_report($(this).attr("href"));
                                return false
                            });
                            $("#section" + (u + 1) + " [data-id]").click(function(x) {
                                r_click($(this).data("id"), $(this).data("sid"))
                            });
                            $("#loading").remove();
                            g = false;
                            u++;
                            if (u >= t) {
                                $("#showMore").hide()
                            }
                        }
                    })
                }
                return false
            })
        }
    }
    $("img.lazy").lazyload({
        threshold: 600
    });
    $("#topsearch").autocomplete({
        serviceUrl:BASE_URL + "autocomplete?l=" + $("#topsearch").data("l"),
        paramName: "q",
        minChars: 2,
        triggerSelectOnValidInput: false,
        onSelect: function(w) {
            $(this).parents("#searchform").children('input[name="f"]').val(2);
            $(this).parents("#searchform").submit()
        }
    });
    $("#bottomsearch").autocomplete({
        serviceUrl: BASE_URL + "autocomplete?l=" + $("#bottomsearch").data("l"),
        paramName: "q",
        minChars: 2,
        triggerSelectOnValidInput: false,
        onSelect: function(w) {
            $(this).parents("#searchform").children('input[name="f"]').val(2);
            $(this).parents("#searchform").submit()
        }
    })
});
! function(a, b, c, d) {
    var e = a(b);
    a.fn.lazyload = function(f) {
        function g() {
            var b = 0;
            i.each(function() {
                var c = a(this);
                if (!j.skip_invisible || c.is(":visible"))
                    if (a.abovethetop(this, j) || a.leftofbegin(this, j));
                    else if (a.belowthefold(this, j) || a.rightoffold(this, j)) {
                    if (++b > j.failure_limit) return !1
                } else c.trigger("appear"), b = 0
            })
        }
        var h, i = this,
            j = {
                threshold: 0,
                failure_limit: 0,
                event: "scroll",
                effect: "show",
                container: b,
                data_attribute: "tn",
                skip_invisible: !0,
                appear: null,
				//appear          : function(ele,settings)
				//{
				//	$(ele).attr("src",$(ele).attr("data-original"));
				//},
                load: null,
                placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAMAAAAoyzS7AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////AAAAVcLTfgAAAAF0Uk5TAEDm2GYAAAAMSURBVHjaYmAACDAAAAIAAU9tWeEAAAAASUVORK5CYII="
            };
        return f && (d !== f.failurelimit && (f.failure_limit = f.failurelimit, delete f.failurelimit), d !== f.effectspeed && (f.effect_speed = f.effectspeed, delete f.effectspeed), a.extend(j, f)), h = j.container === d || j.container === b ? e : a(j.container), 0 === j.event.indexOf("scroll") && h.bind(j.event, function() {
            return g()
        }), this.each(function() {
            var b = this,
                c = a(b);
            b.loaded = !1, (c.attr("src") === d || c.attr("src") === !1) && c.attr("src", j.placeholder), c.one("appear", function() {
                if (!this.loaded) {
                    if (j.appear) {
                        var d = i.length;
                        j.appear.call(b, d, j)
                    }


					var src_main =  BASE_URL_THUMB + 't/'+ c.data(j.data_attribute) +'.jpg';
                    a("<img />").bind("load", function() {
                        var d = src_main;
						//console.log(d);
                        c.hide(), c.is("img") ? c.attr("src", d) : c.css("background-image", "url('" + d + "')"), c[j.effect](j.effect_speed), b.loaded = !0;
                        var e = a.grep(i, function(a) {
                            return !a.loaded
                        });
                        if (i = a(e), j.load) {
                            var f = i.length;
                            j.load.call(b, f, j)
                        }
                    }).attr("src", src_main)
					.on('error', function()
					{
                        //var src_error = Get_Thumb_Error(c);
                        //c.attr("src", src_error);

					})
                }
            }), 0 !== j.event.indexOf("scroll") && c.bind(j.event, function() {
                b.loaded || c.trigger("appear")
            })
        }), e.bind("resize", function() {
            g()
        }), /iphone|ipod|ipad.*os 5/gi.test(navigator.appVersion) && e.bind("pageshow", function(b) {
            b.originalEvent && b.originalEvent.persisted && i.each(function() {
                a(this).trigger("appear")
            })
        }), a(c).ready(function() {
            g()
        }), this
    }, a.belowthefold = function(c, f) {
        var g;
        return g = f.container === d || f.container === b ? (b.innerHeight ? b.innerHeight : e.height()) + e.scrollTop() : a(f.container).offset().top + a(f.container).height(), g <= a(c).offset().top - f.threshold
    }, a.rightoffold = function(c, f) {
        var g;
        return g = f.container === d || f.container === b ? e.width() + e.scrollLeft() : a(f.container).offset().left + a(f.container).width(), g <= a(c).offset().left - f.threshold
    }, a.abovethetop = function(c, f) {
        var g;
        return g = f.container === d || f.container === b ? e.scrollTop() : a(f.container).offset().top, g >= a(c).offset().top + f.threshold + a(c).height()
    }, a.leftofbegin = function(c, f) {
        var g;
        return g = f.container === d || f.container === b ? e.scrollLeft() : a(f.container).offset().left, g >= a(c).offset().left + f.threshold + a(c).width()
    }, a.inviewport = function(b, c) {
        return !(a.rightoffold(b, c) || a.leftofbegin(b, c) || a.belowthefold(b, c) || a.abovethetop(b, c))
    }, a.extend(a.expr[":"], {
        "below-the-fold": function(b) {
            return a.belowthefold(b, {
                threshold: 0
            })
        },
        "above-the-top": function(b) {
            return !a.belowthefold(b, {
                threshold: 0
            })
        },
        "right-of-screen": function(b) {
            return a.rightoffold(b, {
                threshold: 0
            })
        },
        "left-of-screen": function(b) {
            return !a.rightoffold(b, {
                threshold: 0
            })
        },
        "in-viewport": function(b) {
            return a.inviewport(b, {
                threshold: 0
            })
        },
        "above-the-fold": function(b) {
            return !a.belowthefold(b, {
                threshold: 0
            })
        },
        "right-of-fold": function(b) {
            return a.rightoffold(b, {
                threshold: 0
            })
        },
        "left-of-fold": function(b) {
            return !a.rightoffold(b, {
                threshold: 0
            })
        }
    })
}(jQuery, window, document);

