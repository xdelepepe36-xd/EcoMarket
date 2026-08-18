// Lazy Loading - Carga diferida de imágenes
class EcoLazyLoading {
    constructor() {
        this.init();
    }

    init() {
        this.lazyLoadImages();
        this.lazyLoadVideos();
        this.addLoadingSkeleton();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    lazyLoadVideos() {
        const videos = document.querySelectorAll('video[data-src]');
        const videoObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.src = video.dataset.src;
                    video.load();
                    observer.unobserve(video);
                }
            });
        });

        videos.forEach(video => videoObserver.observe(video));
    }

    addLoadingSkeleton() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('load', () => {
                img.classList.add('loaded');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EcoLazyLoading();
});