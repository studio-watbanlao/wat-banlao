import Slider from 'react-slick';

export { default as CarouselArrows } from './carousel-arrows';
export { default as CarouselDots } from './carousel-dots';
export { default as useCarousel } from './use-carousel';

export { default as CarouselArrowIndex } from './carousel-arrow-index';

const Carousel = Slider as unknown as React.FC<any>;

export default Carousel;
