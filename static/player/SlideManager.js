var SlideManager = Class.create({
    initialize: function(c) {
        this.showUrl = c.showUrl
        this.header = c.header;
        this.slides = {};
        for (var a = 0, b = this.header.slideList.length; a < b; a++) {
            this.slides[this.header.slideList[a]] = {
                downloaded: false,
                script: {},
                retry: 0
            }
        }
    },
    getSlides: function(d, b) {
        for (var a = 0, c = d.length; a < c; a++) {
            var e = d[a];
            this.slides[e].downloaded = true;
            this.slides[e].script = JSON.parse(b.getKPFJsonStringForSlideIndex(a));
            this.slides[e].originalScript = JSON.parse(b.getKPFJsonStringForSlideIndex(a));
            document.fire(kSlideDidDownloadEvent, {
                id: e
            })
        }
    },
    downloadSlides: function(c) {
        for (var a = 0, b = c.length; a < b; a++) {
            this.downloadSlide(c[a])
        }
    },
    downloadSlide: function(b) {
        var c = this.showUrl + b + "/" + b + ".json";
        console.log("SLIDE LOC -> " + c)
        if (window.location.protocol === "file:") {
            c = c + "p";
            if (window.local_slide == null || window.local_slide == undefined) {
                window.local_slide = (function(d) {
                    this.slideDidDownload(null, d, true)
                }).bind(this)
            }
            var a = document.createElement("script");
            a.setAttribute("src", c);
            document.head.appendChild(a)
        } else {
            new Ajax.Request(c, {
                method: "get",
                onSuccess: this.slideDidDownload.bind(this, b),
                onFailure: this.slideDidNotDownload.bind(this, b)
            })
        }
    },
    slideDidDownload: function(c, b, a) {
        if (a) {
            c = b.name;
            this.slides[c].script = b.json;
            this.slides[c].originalScript = JSON.parse(JSON.stringify(b.json))
        } else {
            this.slides[c].script = JSON.parse(b.responseText);
            this.slides[c].originalScript = JSON.parse(b.responseText)
        }
        this.slides[c].downloaded = true;
        document.fire(kSlideDidDownloadEvent, {
            id: c
        })
    },
    slideDidNotDownload: function() {
        var a = arguments[0];
        if (arguments[1].status != 200) {
            if (this.slides[a].retry < 1) {
                this.downloadSlide(a);
                this.slides[a].retry++
            } else {
                document.fire(kSlideDidNotDownloadEvent, {
                    id: a
                })
            }
        }
    }
});