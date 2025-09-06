import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
interface images {
  url:string,
  link?:string
}
interface CustomSwipperProps {
  images: images[];
  height: number;
  width: string; // Changed to string to accept Tailwind classes
  autoPlay: boolean;
  interval: number;
  showPagination: boolean;
  showNavigation: boolean;
  cursorScroll?: boolean;
}

const CustomSwipper = ({
  images,
  height,
  width,
  autoPlay,
  interval,
  showPagination,
  showNavigation,
}: CustomSwipperProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (autoPlay) {
      const autoSlide = setInterval(() => {
        handleNext();
      }, interval);
      return () => clearInterval(autoSlide);
    }
  }, [currentIndex, autoPlay, interval]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  const navigate = useNavigate();
  return (
    <div
      className={`relative overflow-hidden ${width}`}
      style={{ height: `${height}px` }}
    >
      {/* Slide Images */}
      <div
        className="flex transition-transform duration-700"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image.url}
            alt={`slide-${index}`}
            className="w-full h-full object-cover flex-shrink-0
            hover:cursor-pointer 
            "
            style={{ minWidth: '100%', height: `${height}px` }}
            onClick={()=>{
              image.link && navigate(image.url)
            }}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      {showNavigation && (
        <>
          <button
            onClick={handlePrev}
            className="absolute top-1/2 w-24 transform -translate-y-1/2 px-2 py-1 h-full "
          >
            ❮
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-0 w-24 transform -translate-y-1/2 px-2 py-1 h-full"
          >
            ❯
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {showPagination && (
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full 
                border-2 
                ${
                index === currentIndex ? "border-blue-500 bg-green-500" : "bg-none border-gray-100"
              }`}
            ></button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSwipper;
