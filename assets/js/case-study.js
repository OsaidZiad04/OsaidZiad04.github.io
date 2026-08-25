(() => {
    "use strict";

    const progress = document.querySelector("[data-reading-progress]");
    const article = document.querySelector("[data-case-study]");

    if (progress && article) {
        const updateProgress = () => {
            const articleTop = article.getBoundingClientRect().top + window.scrollY;
            const scrollable = Math.max(article.offsetHeight - window.innerHeight, 1);
            const amount = Math.min(Math.max((window.scrollY - articleTop) / scrollable, 0), 1);

            progress.style.transform = `scaleX(${amount})`;
            progress.parentElement?.setAttribute("aria-valuenow", String(Math.round(amount * 100)));
        };

        updateProgress();
        window.addEventListener("scroll", updateProgress, { passive: true });
        window.addEventListener("resize", updateProgress);
    }

    const caseLinks = [...document.querySelectorAll("[data-case-nav] a")];
    const sections = caseLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if (caseLinks.length && sections.length && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visible) return;

            caseLinks.forEach((link) => {
                const active = link.getAttribute("href") === `#${visible.target.id}`;
                link.classList.toggle("is-active", active);

                if (active) {
                    link.setAttribute("aria-current", "location");
                    link.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
                } else {
                    link.removeAttribute("aria-current");
                }
            });
        }, { rootMargin: "-30% 0px -58%", threshold: [0.01, 0.2] });

        sections.forEach((section) => observer.observe(section));
    }

    const lightbox = document.querySelector("[data-lightbox]");
    const lightboxImage = lightbox?.querySelector("img");
    const lightboxCaption = lightbox?.querySelector("[data-lightbox-caption]");
    const lightboxClose = lightbox?.querySelector("[data-lightbox-close]");
    const lightboxOpeners = document.querySelectorAll("[data-lightbox-open]");
    let lastFocusedElement = null;

    const closeLightbox = () => {
        if (!lightbox?.open) return;
        lightbox.close();
        lastFocusedElement?.focus();
    };

    lightboxOpeners.forEach((opener) => {
        opener.addEventListener("click", () => {
            const sourceImage = opener.querySelector("img");
            if (!sourceImage) return;

            if (!lightbox || !lightboxImage || typeof lightbox.showModal !== "function") {
                window.open(sourceImage.currentSrc || sourceImage.src, "_blank", "noopener");
                return;
            }

            lastFocusedElement = opener;
            lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
            lightboxImage.alt = sourceImage.alt;

            if (lightboxCaption) {
                lightboxCaption.textContent = opener.dataset.caption || sourceImage.alt;
            }

            lightbox.showModal();
            lightboxClose?.focus();
        });
    });

    lightboxClose?.addEventListener("click", closeLightbox);

    lightbox?.addEventListener("click", (event) => {
        if (event.target !== lightbox) return;

        const bounds = lightbox.getBoundingClientRect();
        const clickedInside = event.clientX >= bounds.left
            && event.clientX <= bounds.right
            && event.clientY >= bounds.top
            && event.clientY <= bounds.bottom;

        if (!clickedInside) closeLightbox();
    });

    lightbox?.addEventListener("close", () => {
        lightboxImage?.removeAttribute("src");
    });
})();
