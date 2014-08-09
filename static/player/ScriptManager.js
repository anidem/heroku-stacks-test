var kShowSizeDidChangeEvent = "ScriptManager:ShowSizeDidChangeEvent";
var kScriptDidDownloadEvent = "ScriptManager:ScriptDidDownloadEvent";
var kScriptDidNotDownloadEvent = "ScriptManager:ScriptDidNotDownloadEvent";
var kSlideDidDownloadEvent = "SlideManager:SlideDidDownloadEvent";
var kSlideDidNotDownloadEvent = "SlideManager:SlideDidNotDownloadEvent";
var ScriptManager = Class.create({
    initialize: function(a) {
        this.script = null;
        this.showUrl = a;
        this.slideManager = null;
        document.observe(kSlideDidDownloadEvent, this.handleSlideDidDownloadEvent.bind(this));
        document.observe(kSlideDidNotDownloadEvent, this.handleSlideDidDownloadEvent.bind(this))
    },
    handleSlideDidDownloadEvent: function(d) {
        var l = true;
        for (var m in this.slideManager.slides) {
            if (this.slideManager.slides.hasOwnProperty(m)) {
                if (!this.slideManager.slides[m].downloaded) {
                    l = false;
                    break
                }
            }
        }
        if (l) {
            this.script.events = [];
            this.script.originalEvents = [];
            this.script.slideIndexFromSceneIndexLookup = {};
            this.script.sceneIndexFromSlideIndexLookup = {};
            this.script.slides = {};
            this.script.originalSlides = {};
            var n, h, j, g, k = 0,
                b = 0,
                a = 0;
            for (var m in this.slideManager.slides) {
                if (this.slideManager.slides.hasOwnProperty(m)) {
                    j = this.slideManager.slides[m].script;
                    g = this.slideManager.slides[m].originalScript;
                    n = j.events;
                    h = g.events;
                    this.script.slides[m] = j;
                    this.script.originalSlides[m] = g;
                    this.script.sceneIndexFromSlideIndexLookup[k] = b;
                    for (var f = 0, e = n.length; f < e; f++) {
                        this.script.events.push(n[f]);
                        this.script.originalEvents.push(h[f]);
                        this.script.slideIndexFromSceneIndexLookup[a] = k;
                        a += 1
                    }
                    k += 1;
                    b = a
                }
            }
            this.script.numScenes = this.script.events.length;
            this.script.lastSceneIndex = this.script.numScenes - 1;
            this.script.lastSlideIndex = this.script.slideList.length - 1;
            this.script.originalSlideWidth = this.script.slideWidth;
            this.script.originalSlideHeight = this.script.slideHeight;
            if (browserPrefix === "ms") {
                this.adjustScriptForIE()
            } else {
                this.adjustScript()
            } if (this.delegate.setViewScale) {
                this.applyScaleFactor();
                this.delegate.setViewScale(this.scaleFactor)
            }
            if (this.delegate.isUsingPreloadedFont && this.delegate.isUsingPreloadedFont()) {
                var c = document.createElement("style");
                c.type = "text/css";
                c.appendChild(document.createTextNode(this.delegate.getFontFamilyDefinitionsCssString()));
                document.getElementsByTagName("head")[0].appendChild(c)
            } else {
                this.getFontFamilyDefinitionsCssString()
            }
            document.fire(kScriptDidDownloadEvent, {
                script: this.script,
                delegate: this.delegate
            });
            document.fire(kShowSizeDidChangeEvent, {
                width: this.script.slideWidth,
                height: this.script.slideHeight
            })
        }
    },
    getFontFamilyDefinitionsCssString: function() {
        if (typeof(GSFT) === "undefined") {
            GSFT = {}
        }
        GSFT.FontFamilyDefinitionsJsonp = GSFT.FontFamilyDefinitionsJsonp || {};
        GSFT.FontFamilyDefinitionsJsonp.urlPrefix = "https://www.icloud.com";
        GSFT.FontFamilyDefinitionsJsonp.cssStringDictReady = function(d) {
            var g = "";
            var f = gShowController.scriptManager.script.fonts;
            var c = document.createElement("style");
            c.type = "text/css";
            for (var b = 0, e = f.length; b < e; b++) {
                var a = f[b];
                if (d[a]) {
                    g = g + d[a]
                }
            }
            c.appendChild(document.createTextNode(g));
            document.getElementsByTagName("head")[0].appendChild(c)
        };
        (function() {
            var a = document.createElement("script");
            a.src = GSFT.FontFamilyDefinitionsJsonp.urlPrefix + "/iw/fonts/font_family_definitions_jsonp.json";
            document.getElementsByTagName("head")[0].appendChild(a)
        })()
    },
    adjustScript: function() {
        for (var c = 0, f = this.script.events.length; c < f; c++) {
            var d = this.script.events[c];
            var e = this.script.originalEvents[c];
            for (var h = 0, o = d.effects.length; h < o; h++) {
                var s = d.effects[h];
                var m = e.effects[h];
                this.adjustEffects(s, m);
                this.adjustEmphasisBuilds(s, m);
                if (isMacOS && isChrome) {
                    this.adjustEffectsForChrome(s, m)
                }
                if (browserPrefix === "moz") {
                    this.adjustEffectsForFirefox(s, m)
                }
            }
            for (var h = 0, b = d.hyperlinks.length; h < b; h++) {
                var q = d.hyperlinks[h];
                var n = e.hyperlinks[h];
                for (var r in q.events) {
                    var k = q.events[r];
                    var l = n.events[r];
                    for (var g = 0, o = k.effects.length; g < o; g++) {
                        var p = k.effects[g];
                        var a = l.effects[g];
                        this.adjustEffects(p, a);
                        this.adjustEmphasisBuilds(p, a);
                        if (isMacOS && isChrome) {
                            this.adjustEffectsForChrome(s, m)
                        }
                        if (browserPrefix === "moz") {
                            this.adjustEffectsForFirefox(s, m)
                        }
                    }
                }
            }
        }
    },
    adjustEffects: function(k, h) {
        switch (k.name) {
            case "apple:doorway":
                var j = h.baseLayer.layers[0];
                var c = k.baseLayer.layers[0];
                var d = j.layers[1];
                j.layers[1] = j.layers[2];
                j.layers[2] = d;
                var b = c.layers[1];
                c.layers[1] = c.layers[2];
                c.layers[2] = b;
                if (isChrome) {
                    j.layers[1].layers[0].initialState.masksToBounds = true;
                    j.layers[1].layers[1].initialState.masksToBounds = true;
                    c.layers[1].layers[0].initialState.masksToBounds = true;
                    c.layers[1].layers[1].initialState.masksToBounds = true;
                    j.layers[1].layers[0].layers[0].initialState.masksToBounds = true;
                    j.layers[1].layers[1].layers[0].initialState.masksToBounds = true;
                    c.layers[1].layers[0].layers[0].initialState.masksToBounds = true;
                    c.layers[1].layers[1].layers[0].initialState.masksToBounds = true
                }
                break;
            case "apple:ca-isometric":
                for (var e = 0, a = k.baseLayer.layers.length; e < a; e++) {
                    var g = k.baseLayer.layers[e];
                    var f = k.baseLayer.layers[e];
                    this.adjustPerspective(g, f)
                }
                break;
            case "apple:apple-grid":
                var j = h.baseLayer.layers[0];
                var c = k.baseLayer.layers[0];
                c.layers.splice(0, 2);
                j.layers.splice(0, 2);
                break;
            case "com.apple.iWork.Keynote.BLTSwoosh":
                var j = h.baseLayer.layers[0];
                var c = k.baseLayer.layers[0];
                if (k.type === "transition") {
                    c.layers[1].layers[0].layers.splice(0, 1);
                    j.layers[1].layers[0].layers.splice(0, 1);
                    var d = j.layers[1];
                    j.layers[1] = j.layers[2];
                    j.layers[2] = d;
                    var b = c.layers[1];
                    c.layers[1] = c.layers[2];
                    c.layers[2] = b
                }
                break;
            default:
                break
        }
    },
    adjustPerspective: function(c, g) {
        if (c.animations[0] && c.animations[0].animations.length > 0) {
            var e = c.animations[0].beginTime;
            var a = c.animations[0].animations[0].beginTime;
            var h = e === a ? c.animations[0].animations : c.animations[0].animations[0].animations;
            var b = e === a ? g.animations[0].animations : g.animations[0].animations[0].animations;
            for (i = 0, length = h.length; i < length; i++) {
                var d = h[i];
                var f = b[i];
                if (d.property === "sublayerTransform.rotation.x") {
                    d.property = "transform.rotation.x";
                    f.property = "transform.rotation.x"
                } else {
                    if (d.property === "sublayerTransform.rotation.y") {
                        d.property = "transform.rotation.y";
                        f.property = "transform.rotation.y"
                    } else {
                        if (d.property === "sublayerTransform.transform.scale") {
                            d.property = "transform.scale";
                            f.property = "transform.scale"
                        }
                    }
                }
            }
        }
    },
    adjustEmphasisBuilds: function(t, o) {
        switch (t.name) {
            case "apple:action-jiggle":
                var m = o.baseLayer.layers[0];
                var n = t.baseLayer.layers[0];
                var b = m.animations[0];
                var f = n.animations[0];
                var a = f.animations.length;
                for (var h = 0; h < a; h++) {
                    var l = Math.ceil(f.duration / f.animations[h].duration);
                    for (var g = 0; g < l - 1; g++) {
                        var r = JSON.parse(JSON.stringify(b.animations[h]));
                        var e = JSON.parse(JSON.stringify(f.animations[h]));
                        r.beginTime = b.animations[h].duration * (g + 1);
                        e.beginTime = f.animations[h].duration * (g + 1);
                        m.animations[0].animations.push(r);
                        n.animations[0].animations.push(e);
                        if (g === l - 2) {
                            r.duration = f.duration - r.beginTime;
                            e.duration = f.duration - e.beginTime;
                            if (f.animations[h].property === "transform.rotation.z") {
                                r.to.scalar = 0;
                                e.to.scalar = 0
                            } else {
                                if (f.animations[h].property === "position") {
                                    r.to.pointX = (r.from.pointX + r.to.pointX) / 2;
                                    e.to.pointX = (e.from.pointX + e.to.pointX) / 2
                                }
                            }
                        }
                    }
                }
                break;
            case "apple:action-blink":
            case "apple:action-pulse":
                var m = o.baseLayer.layers[0];
                var n = t.baseLayer.layers[0];
                var b = m.animations[0];
                var f = n.animations[0];
                var q = [];
                var p = [];
                var s = 0;
                var l = 1;
                if (f.repeatCount) {
                    l = Math.floor(f.repeatCount)
                }
                m.animations[0].duration = f.duration * l;
                n.animations[0].duration = f.duration * l;
                for (var h = 0, a = f.animations.length; h < a; h++) {
                    p.push(JSON.stringify(f.animations[h]));
                    q.push(JSON.stringify(b.animations[h]));
                    s = f.animations[h].beginTime + f.animations[h].duration
                }
                for (var h = 0; h < l - 1; h++) {
                    for (var g = 0, a = p.length; g < a; g++) {
                        var r = JSON.parse(q[g]);
                        var e = JSON.parse(p[g]);
                        r.beginTime = s;
                        e.beginTime = s;
                        m.animations[0].animations.push(r);
                        n.animations[0].animations.push(e);
                        s = r.beginTime + r.duration
                    }
                }
                break;
            default:
                break
        }
        for (var d = 0, c = t.effects.length; d < c; d++) {
            this.adjustEmphasisBuilds(t.effects[d], o.effects[d])
        }
    },
    adjustEffectsForChrome: function(c, a) {
        if (c.name === "none") {
            var b = a.baseLayer.layers[0];
            var d = c.baseLayer.layers[0];
            if (b.layers[1].animations[0].animations && b.layers[1].animations[0].animations.length > 0) {
                b.layers[1].animations[0].animations[0].property = "opacity";
                d.layers[1].animations[0].animations[0].property = "opacity";
                b.layers[1].animations[0].animations[0].from = {
                    scalar: 1
                };
                b.layers[1].animations[0].animations[0].to = {
                    scalar: 0
                };
                d.layers[1].animations[0].animations[0].from = {
                    scalar: 1
                };
                d.layers[1].animations[0].animations[0].to = {
                    scalar: 0
                }
            } else {
                b.layers[1].animations[0].property = "opacity";
                d.layers[1].animations[0].property = "opacity";
                b.layers[1].animations[0].from = {
                    scalar: 1
                };
                b.layers[1].animations[0].to = {
                    scalar: 0
                };
                d.layers[1].animations[0].from = {
                    scalar: 1
                };
                d.layers[1].animations[0].to = {
                    scalar: 0
                }
            }
        }
    },
    adjustEffectsForFirefox: function(s, n) {
        switch (s.name) {
            case "apple:scale":
                var r = n.baseLayer.layers[0];
                var l = s.baseLayer.layers[0];
                if (r.layers[0].animations.length > 0) {
                    var m = r.layers[0];
                    r.layers[0] = r.layers[1];
                    r.layers[1] = m;
                    r.layers[1].initialState.hidden = true;
                    var f = l.layers[0];
                    l.layers[0] = l.layers[1];
                    l.layers[1] = f;
                    l.layers[1].initialState.hidden = true;
                    var a = r.layers[1].animations[0].beginTime;
                    var c = r.layers[1].animations[0].duration;
                    var h = r.layers[1].animations[0].animations[0].beginTime;
                    var e = r.layers[1].animations[0].animations[0].duration;
                    var k;
                    if (a == h) {
                        for (var g = 0, p = r.layers[1].animations[0].animations.length; g < p; g++) {
                            if (r.layers[1].animations[0].animations[g].property === "transform.translation.z") {
                                r.layers[1].animations[0].animations.splice(g, 1);
                                l.layers[1].animations[0].animations.splice(g, 1)
                            }
                        }
                        k = {
                            animations: [],
                            beginTime: a,
                            duration: c,
                            fillMode: "forwards",
                            from: {
                                scalar: false
                            },
                            property: "hidden",
                            timingFunction: "linear",
                            to: {
                                scalar: false
                            }
                        };
                        r.layers[1].animations[0].animations.push(k);
                        l.layers[1].animations[0].animations.push(k)
                    } else {
                        for (var g = 0, p = r.layers[1].animations[0].animations[0].animations.length; g < p; g++) {
                            if (r.layers[1].animations[0].animations[0].animations[g].property === "transform.translation.z") {
                                r.layers[1].animations[0].animations[0].animations.splice(g, 1);
                                l.layers[1].animations[0].animations[0].animations.splice(g, 1)
                            }
                        }
                        k = {
                            animations: [],
                            beginTime: r.layers[1].animations[0].animations[0].animations[0].beginTime + 0.03,
                            duration: r.layers[1].animations[0].animations[0].animations[0].duration,
                            fillMode: "forwards",
                            from: {
                                scalar: false
                            },
                            property: "hidden",
                            timingFunction: "linear",
                            to: {
                                scalar: false
                            }
                        };
                        r.layers[1].animations[0].animations[0].animations.push(k);
                        l.layers[1].animations[0].animations[0].animations.push(k)
                    }
                }
                break;
            case "com.apple.iWork.Keynote.KLNSwap":
                var r = n.baseLayer.layers[0];
                var l = s.baseLayer.layers[0];
                var e, d, o, b, q;
                if (r.layers[1].animations[0].animations.length > 1) {
                    for (var g = 0, p = r.layers[1].animations[0].animations.length; g < p; g++) {
                        b = r.layers[1].animations[0].animations[g];
                        q = l.layers[1].animations[0].animations[g];
                        if (b.property === "opacity") {
                            break
                        }
                    }
                    e = r.layers[1].animations[0].duration
                } else {
                    for (var g = 0, p = r.layers[1].animations[0].animations[0].animations.length; g < p; g++) {
                        b = r.layers[1].animations[0].animations[0].animations[g];
                        q = l.layers[1].animations[0].animations[0].animations[g];
                        if (b.property === "opacity") {
                            break
                        }
                    }
                    e = r.layers[1].animations[0].animations[0].duration
                }
                d = e * 0.4;
                o = e * 0.4;
                b.to.scalar = 0;
                b.beginTime = d;
                b.duration = o;
                q.to.scalar = 0;
                q.beginTime = d;
                q.duration = o;
                break;
            default:
                break
        }
    },
    adjustScriptForIE: function() {
        for (var c = 0, f = this.script.events.length; c < f; c++) {
            var d = this.script.events[c];
            var e = this.script.originalEvents[c];
            for (var h = 0, o = d.effects.length; h < o; h++) {
                var s = d.effects[h];
                var m = e.effects[h];
                this.adjustEffectsForIE(s, m);
                this.adjustEmphasisBuilds(s, m)
            }
            for (var h = 0, b = d.hyperlinks.length; h < b; h++) {
                var q = d.hyperlinks[h];
                var n = e.hyperlinks[h];
                for (var r in q.events) {
                    var k = q.events[r];
                    var l = n.events[r];
                    for (var g = 0, o = k.effects.length; g < o; g++) {
                        var p = k.effects[g];
                        var a = l.effects[g];
                        this.adjustEffectsForIE(p, a);
                        this.adjustEmphasisBuilds(p, a)
                    }
                }
            }
        }
    },
    adjustEffectsForIE: function(o, p) {
        switch (o.name) {
            case "apple:ca-isometric":
                for (var t = 0, c = o.baseLayer.layers.length; t < c; t++) {
                    var w = o.baseLayer.layers[t];
                    var d = o.baseLayer.layers[t];
                    this.adjustPerspective(w, d)
                }
                break;
            case "apple:bounce":
            case "apple:slide":
            case "apple:pivot":
            case "apple:scale":
                var m = p.baseLayer.layers[0];
                var h = o.baseLayer.layers[0];
                if (m.layers[0].animations.length > 0) {
                    var v = m.layers[0];
                    m.layers[0] = m.layers[1];
                    m.layers[1] = v;
                    m.layers[1].initialState.hidden = true;
                    var q = h.layers[0];
                    h.layers[0] = h.layers[1];
                    h.layers[1] = q;
                    h.layers[1].initialState.hidden = true;
                    var n = m.layers[1].animations[0].beginTime;
                    var l = m.layers[1].animations[0].duration;
                    var r = m.layers[1].animations[0].animations[0].beginTime;
                    var a = m.layers[1].animations[0].animations[0].duration;
                    var e;
                    if (n == r) {
                        for (var s = 0, k = m.layers[1].animations[0].animations.length; s < k; s++) {
                            if (m.layers[1].animations[0].animations[s].property === "transform.translation.z") {
                                m.layers[1].animations[0].animations.splice(s, 1);
                                h.layers[1].animations[0].animations.splice(s, 1)
                            }
                        }
                        e = {
                            animations: [],
                            beginTime: n,
                            duration: l,
                            fillMode: "forwards",
                            from: {
                                scalar: false
                            },
                            property: "hidden",
                            timingFunction: "linear",
                            to: {
                                scalar: false
                            }
                        };
                        m.layers[1].animations[0].animations.push(e);
                        h.layers[1].animations[0].animations.push(e)
                    } else {
                        for (var s = 0, k = m.layers[1].animations[0].animations[0].animations.length; s < k; s++) {
                            if (m.layers[1].animations[0].animations[0].animations[s].property === "transform.translation.z") {
                                m.layers[1].animations[0].animations[0].animations.splice(s, 1);
                                h.layers[1].animations[0].animations[0].animations.splice(s, 1)
                            }
                        }
                        e = {
                            animations: [],
                            beginTime: m.layers[1].animations[0].animations[0].animations[0].beginTime + 0.03,
                            duration: m.layers[1].animations[0].animations[0].animations[0].duration,
                            fillMode: "forwards",
                            from: {
                                scalar: false
                            },
                            property: "hidden",
                            timingFunction: "linear",
                            to: {
                                scalar: false
                            }
                        };
                        m.layers[1].animations[0].animations[0].animations.push(e);
                        h.layers[1].animations[0].animations[0].animations.push(e)
                    }
                }
                break;
            case "apple:doorway":
                var m = p.baseLayer.layers[0];
                var h = o.baseLayer.layers[0];
                var n = m.layers[0].animations[0].beginTime;
                var l = m.layers[0].animations[0].duration;
                var r = m.layers[0].animations[0].animations[0].beginTime;
                var a = m.layers[0].animations[0].animations[0].duration;
                m.layers[0].layers = [];
                m.layers[0].animations = [];
                h.layers[0].layers = [];
                h.layers[0].animations = [];
                if (n == r) {
                    m.layers[1].animations[0].animations[0].beginTime = r;
                    m.layers[1].animations[0].animations[0].duration = a;
                    h.layers[1].animations[0].animations[0].beginTime = r;
                    h.layers[1].animations[0].animations[0].duration = a
                } else {
                    m.layers[1].animations[0].animations[0].animations[0].duration = a;
                    h.layers[1].animations[0].animations[0].animations[0].duration = a
                }
                m.layers.splice(2, 1);
                h.layers.splice(2, 1);
                break;
            case "apple:3D-cube":
            case "com.apple.iWork.Keynote.BLTReflection":
            case "apple:revolve":
            case "com.apple.iWork.Keynote.BLTRevolvingDoor":
                var m = p.baseLayer.layers[0];
                var h = o.baseLayer.layers[0];
                var f;
                f = {
                    animations: [],
                    beginTime: 0,
                    duration: p.duration,
                    fillMode: "both",
                    from: {
                        scalar: 1
                    },
                    property: "opacity",
                    timingFunction: "easeInEaseOut",
                    to: {
                        scalar: 0
                    }
                };
                m.layers[0].layers = [];
                m.layers[0].animations = [];
                m.layers[1].layers = [];
                m.layers[1].animations = [];
                m.layers[1].animations.push(f);
                h.layers[0].layers = [];
                h.layers[0].animations = [];
                h.layers[1].layers = [];
                h.layers[1].animations = [];
                h.layers[1].animations.push(f);
                break;
            case "com.apple.iWork.Keynote.KLNSwap":
                var m = p.baseLayer.layers[0];
                var h = o.baseLayer.layers[0];
                var a, g, u, b, f;
                if (m.layers[1].animations[0].animations.length > 1) {
                    for (var s = 0, k = m.layers[1].animations[0].animations.length; s < k; s++) {
                        b = m.layers[1].animations[0].animations[s];
                        f = h.layers[1].animations[0].animations[s];
                        if (b.property === "opacity") {
                            break
                        }
                    }
                    a = m.layers[1].animations[0].duration
                } else {
                    for (var s = 0, k = m.layers[1].animations[0].animations[0].animations.length; s < k; s++) {
                        b = m.layers[1].animations[0].animations[0].animations[s];
                        f = h.layers[1].animations[0].animations[0].animations[s];
                        if (b.property === "opacity") {
                            break
                        }
                    }
                    a = m.layers[1].animations[0].animations[0].duration
                }
                g = a * 0.4;
                u = a * 0.4;
                b.to.scalar = 0;
                b.beginTime = g;
                b.duration = u;
                f.to.scalar = 0;
                f.beginTime = g;
                f.duration = u;
                break;
            case "apple:FlipThrough":
                var m = p.baseLayer.layers[0];
                var h = o.baseLayer.layers[0];
                if (m.layers[0].animations.length > 0) {
                    var v = JSON.parse(JSON.stringify(m.layers[1]));
                    m.layers.splice(0, 0, v);
                    var q = JSON.parse(JSON.stringify(h.layers[1]));
                    h.layers.splice(0, 0, q);
                    var n = m.layers[1].animations[0].beginTime;
                    var l = m.layers[1].animations[0].duration;
                    var r = m.layers[1].animations[0].animations[0].beginTime;
                    var a = m.layers[1].animations[0].animations[0].duration;
                    var e;
                    if (n == r) {
                        for (var s = 0, k = m.layers[1].animations[0].animations.length; s < k; s++) {
                            if (m.layers[1].animations[0].animations[s].property === "transform.translation.z") {
                                m.layers[1].animations[0].animations.splice(s, 1);
                                h.layers[1].animations[0].animations.splice(s, 1)
                            }
                        }
                        e = {
                            animations: [],
                            beginTime: n + l / 2,
                            duration: l / 2,
                            fillMode: "forwards",
                            from: {
                                scalar: true
                            },
                            property: "hidden",
                            timingFunction: "linear",
                            to: {
                                scalar: true
                            }
                        };
                        m.layers[2].animations[0].animations.push(e);
                        h.layers[2].animations[0].animations.push(e)
                    } else {
                        for (var s = 0, k = m.layers[1].animations[0].animations[0].animations.length; s < k; s++) {
                            if (m.layers[1].animations[0].animations[0].animations[s].property === "transform.translation.z") {
                                m.layers[1].animations[0].animations[0].animations.splice(s, 1);
                                h.layers[1].animations[0].animations[0].animations.splice(s, 1)
                            }
                        }
                        e = {
                            animations: [],
                            beginTime: m.layers[2].animations[0].animations[0].animations[0].beginTime + m.layers[2].animations[0].animations[0].animations[0].duration / 2,
                            duration: m.layers[2].animations[0].animations[0].animations[0].duration / 2,
                            fillMode: "forwards",
                            from: {
                                scalar: true
                            },
                            property: "hidden",
                            timingFunction: "linear",
                            to: {
                                scalar: true
                            }
                        };
                        m.layers[2].animations[0].animations[0].animations.push(e);
                        h.layers[2].animations[0].animations[0].animations.push(e)
                    }
                }
                break;
            default:
                break
        }
    },
    handleSlideDidNotDownloadEvent: function(a) {
        this.scriptDidNotDownload.bind(this)
    },
    reapplyScaleFactor: function() {
        if (this.delegate.setViewScale) {
            this.applyScaleFactor();
            this.delegate.setViewScale(this.scaleFactor)
        }
    },
    applyScaleFactorForAnimation: function(c, b, g) {
        var h = c.property;
        if (c.path) {
            for (var e = 0, k = c.path.length; e < k; e++) {
                var j = c.path[e].points;
                var d = b.path[e].points;
                j[0][0] = d[0][0] * g;
                j[0][1] = d[0][1] * g
            }
        }
        switch (h) {
            case "anchorPointZ":
            case "zPosition":
            case "transform.translation.x":
            case "transform.translation.y":
                if (c.from) {
                    c.from.scalar = b.from.scalar * g
                }
                if (c.to) {
                    c.to.scalar = b.to.scalar * g
                }
                if (c.values) {
                    for (var e = 0, f = c.values.length; e < f; e++) {
                        c.values[e].scalar = b.values[e].scalar * g
                    }
                }
                break;
            case "transform.translation.z":
                if (c.from && c.from.scalar != 1 && c.from.scalar != 0.01) {
                    c.from.scalar = b.from.scalar * g
                }
                if (c.to && c.to.scalar != 1 && c.to.scalar != 0.01) {
                    c.to.scalar = b.to.scalar * g
                }
                if (c.values) {
                    for (var e = 0, f = c.values.length; e < f; e++) {
                        c.values[e].scalar = b.values[e].scalar * g
                    }
                }
                break;
            case "position":
            case "transform.translation":
                if (c.from) {
                    c.from.pointX = b.from.pointX * g;
                    c.from.pointY = b.from.pointY * g
                }
                if (c.to) {
                    c.to.pointX = b.to.pointX * g;
                    c.to.pointY = b.to.pointY * g
                }
                if (c.values) {
                    for (var e = 0, f = c.values.length; e < f; e++) {
                        c.values[e].pointX = b.values[e].pointX * g;
                        c.values[e].pointY = b.values[e].pointY * g
                    }
                }
                break;
            case "transform":
                if (c.from) {
                    c.from.transform[12] = b.from.transform[12] * g;
                    c.from.transform[13] = b.from.transform[13] * g;
                    c.from.transform[14] = b.from.transform[14] * g
                }
                if (c.to) {
                    c.to.transform[12] = b.to.transform[12] * g;
                    c.to.transform[13] = b.to.transform[13] * g;
                    c.to.transform[14] = b.to.transform[14] * g
                }
                if (c.values) {
                    for (var e = 0, f = c.values.length; e < f; e++) {
                        c.values[e].transform[12] = b.values[e].transform[12] * g;
                        c.values[e].transform[13] = b.values[e].transform[13] * g;
                        c.values[e].transform[14] = b.values[e].transform[14] * g
                    }
                }
                break;
            case "bounds":
                if (c.from) {
                    c.from.width = b.from.width * g;
                    c.from.height = b.from.height * g
                }
                if (c.to) {
                    c.to.width = b.to.width * g;
                    c.to.height = b.to.height * g
                }
                break;
            case "transform.scale.xy":
            case "transform.scale.x":
            case "transform.scale.y":
                break
        }
        if (c.animations) {
            for (var e = 0, a = c.animations.length; e < a; e++) {
                this.applyScaleFactorForAnimation(c.animations[e], b.animations[e], g)
            }
        }
    },
    applyScaleFactorForLayer: function(h, g, n, m, l, j) {
        var c = h.initialState;
        var e = g.initialState;
        var d = e.contentsRect;
        c.affineTransform[4] = e.affineTransform[4] * n;
        c.affineTransform[5] = e.affineTransform[5] * n;
        c.width = e.width * n;
        c.height = e.height * n;
        c.position.pointX = e.position.pointX * n;
        c.position.pointY = e.position.pointY * n;
        switch (m) {
            case "com.apple.iWork.Keynote.BLTMosaicFlip":
                this.adjustForCropAnimation(c, d, j.particleCount.x, j.particleCount.y);
                break;
            case "com.apple.iWork.Keynote.BLTReflection":
                var a = h.texture;
                if (a != null) {
                    var k = this.script.slides[l].assets[a];
                    if (k.assetRequest.state === "incoming-reflection" || k.assetRequest.state === "outgoing-reflection") {
                        c.height = c.height / 2;
                        c.position.pointY = c.position.pointY - c.height / 2
                    }
                }
                break;
            default:
                break
        }
        if (h.animations) {
            for (var f = 0, b = h.animations.length; f < b; f++) {
                this.applyScaleFactorForAnimation(h.animations[f], g.animations[f], n)
            }
        }
        for (var f = 0, b = h.layers.length; f < b; f++) {
            this.applyScaleFactorForLayer(h.layers[f], g.layers[f], n, m, l, j)
        }
    },
    applyScaleFactorForBaseLayer: function(b, c, f) {
        var a = b.initialState;
        var g = c.initialState;
        a.affineTransform[4] = g.affineTransform[4] * f;
        a.affineTransform[5] = g.affineTransform[5] * f;
        a.width = g.width * f;
        a.height = g.height * f;
        a.position.pointX = g.position.pointX * f;
        a.position.pointY = g.position.pointY * f;
        for (var d = 0, e = b.layers.length; d < e; d++) {
            this.applyScaleFactorForBaseLayer(b.layers[d], c.layers[d], f)
        }
    },
    applyScaleFactor: function() {
        var y = this.script.originalSlideWidth;
        var F = this.script.originalSlideHeight;
        var s = window.innerWidth;
        var B = window.innerHeight;
        var L = scaleSizeWithinSize(y, F, s, B);
        var f = L.width;
        var o = L.height;
        var k = o / F;
        this.scaleFactor = k;
        this.script.slideWidth = this.script.originalSlideWidth * k;
        this.script.slideHeight = this.script.originalSlideHeight * k;
        for (var Q = 0, q = this.script.events.length; Q < q; Q++) {
            var T = this.script.events[Q];
            var u = this.script.originalEvents[Q];
            var K = this.script.slideIndexFromSceneIndexLookup[Q];
            var I = this.script.slideList[K];
            this.applyScaleFactorForBaseLayer(T.baseLayer, u.baseLayer, k);
            for (var O = 0, c = T.effects.length; O < c; O++) {
                var M = T.effects[O];
                var n = u.effects[O];
                var C = {};
                if (M.name === "com.apple.iWork.Keynote.BLTMosaicFlip") {
                    var G = 0,
                        g = 0;
                    for (var b = 0, J = M.baseLayer.layers[0].layers.length; b < J; b++) {
                        var d = n.baseLayer.layers[0].layers[b];
                        var e = d.initialState.contentsRect;
                        var l = Math.round(e.x / e.width);
                        var z = Math.round(e.y / e.height);
                        if (l > G) {
                            G = l
                        }
                        if (z > g) {
                            g = z
                        }
                    }
                    C.particleCount = {
                        x: G + 1,
                        y: g + 1
                    }
                }
                this.applyScaleFactorForLayer(M.baseLayer, n.baseLayer, k, M.name, I, C)
            }
            for (var O = 0, t = T.hyperlinks.length; O < t; O++) {
                var h = T.hyperlinks[O];
                var w = u.hyperlinks[O];
                var A = h.targetRectangle;
                var D = w.targetRectangle;
                A.y = D.y * k;
                A.x = D.x * k;
                A.width = D.width * k;
                A.height = D.height * k;
                for (var H in h.events) {
                    var m = h.events[H];
                    var x = w.events[H];
                    for (var N = 0, c = m.effects.length; N < c; N++) {
                        var R = m.effects[N];
                        var S = x.effects[N];
                        var C = {};
                        if (R.name === "com.apple.iWork.Keynote.BLTMosaicFlip") {
                            var G = 0,
                                g = 0;
                            for (var b = 0, J = R.baseLayer.layers[0].layers.length; b < J; b++) {
                                var d = R.baseLayer.layers[0].layers[b];
                                var e = d.initialState.contentsRect;
                                var l = Math.round(e.x / e.width);
                                var z = Math.round(e.y / e.height);
                                if (l > G) {
                                    G = l
                                }
                                if (z > g) {
                                    g = z
                                }
                            }
                            C.particleCount = {
                                x: G + 1,
                                y: g + 1
                            }
                        }
                        this.applyScaleFactorForLayer(R.baseLayer, S.baseLayer, k, R.name, I, C)
                    }
                }
            }
        }
        for (var p in this.script.slides) {
            if (this.script.slides.hasOwnProperty(p)) {
                var a = this.script.slides[p];
                var v = this.script.originalSlides[p];
                for (var E in a.assets) {
                    if (a.assets.hasOwnProperty(E)) {
                        var r = a.assets[E];
                        var P = v.assets[E];
                        r.width = P.width * k;
                        r.height = P.height * k
                    }
                }
            }
        }
    },
    adjustForCropAnimation: function(a, b, j, h) {
        var d = this.script.slideWidth;
        var f = this.script.slideHeight;
        var k = Math.floor(d / j);
        var g = Math.floor(f / h);
        var e = Math.round(b.x / b.width);
        var c = Math.round(b.y / b.height);
        if (b.width != 1 || b.height != 1) {
            if (e != j - 1) {
                a.width = k
            } else {
                a.width = d - k * (j - 1)
            } if (c != h - 1) {
                a.height = g
            } else {
                a.height = f - g * (h - 1)
            }
            a.position.pointX = k * e + a.width / 2;
            a.position.pointY = g * c + a.height / 2;
            a.contentsRect.x = k * e / d;
            a.contentsRect.y = g * c / f;
            a.contentsRect.width = a.width / d;
            a.contentsRect.height = a.height / f
        }
    },
    downloadScript: function(b) {
        this.delegate = b;
        if (this.delegate.getKPFJsonStringForShow) {
            this.script = JSON.parse(this.delegate.getKPFJsonStringForShow());
            if (this.script == null) {
                debugMessageAlways(kDebugScriptMangaer_DownloadScript, "An error occured on the server. KPF header json is null.");
                return
            }
            this.slideManager = new SlideManager({
                header: this.script,
                showUrl: this.showUrl
            });
            this.slideManager.getSlides(this.script.slideList, this.delegate);
            return
        }
        this.downloadTimeout = setTimeout(this.scriptDidNotDownload.bind(this), kMaxScriptDownloadWaitTime);
        this.downloadAlreadyFailed = false;
        var c = this.showUrl + "header.json";
        if (window.location.protocol === "file:") {
            c = c + "p";
            window.local_header = (function(d) {
                this.scriptDidDownload(d, true)
            }).bind(this);
            var a = document.createElement("script");
            a.setAttribute("src", c);
            document.head.appendChild(a)
        } else {
            new Ajax.Request(c, {
                method: "get",
                onSuccess: this.scriptDidDownload.bind(this),
                onFailure: this.scriptDidNotDownload.bind(this)
            })
        }
    },
    scriptDidDownload: function(b, a) {
        clearTimeout(this.downloadTimeout);
        if (a) {
            this.script = b
        } else {
            this.script = JSON.parse(b.responseText)
        }
        this.slideManager = new SlideManager({
            header: this.script,
            showUrl: this.showUrl
        });
        this.slideManager.downloadSlides(this.script.slideList)
    },
    scriptDidNotDownload: function(a) {
        this.downloadAlreadyFailed = true;
        if (a) {
            clearTimeout(this.downloadTimeout)
        }
        document.fire(kScriptDidNotDownloadEvent, {})
    },
    sceneIndexFromSlideIndex: function(a) {
        if ((this.script == null) || (a < 0) || (a >= this.script.slideList.length)) {
            return -1
        }
        return this.script.sceneIndexFromSlideIndexLookup[a]
    },
    slideIndexFromSceneIndex: function(a) {
        if ((this.script == null) || (a < 0) || (a >= this.script.events.length)) {
            return -1
        }
        return this.script.slideIndexFromSceneIndexLookup[a]
    }
});