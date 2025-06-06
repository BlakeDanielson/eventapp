import { cn } from "@/lib/utils";
import React from "react";

export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div className={cn("py-10 flex items-center justify-center", containerClassName)}>
      <div
        className={cn(
          "max-w-5xl mx-auto w-full relative rounded-2xl p-2 border border-neutral-200 dark:border-neutral-800",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-auto rounded-xl p-6 border",
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
} & React.HTMLAttributes<HTMLElement>) => {
  const ref = React.useRef<HTMLElement>(null);
  const [isMouseEntered, setIsMouseEntered] = React.useState(false);

  const handleMouseEnter = () => {
    setIsMouseEntered(true);
  };

  const handleMouseLeave = () => {
    setIsMouseEntered(false);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return;
      const { height, width, left, top } = ref.current.getBoundingClientRect();
      const mouseX = (e.clientX - left - width / 2) / width;
      const mouseY = (e.clientY - top - height / 2) / height;
      const rotateXValue = mouseY * 10;
      const rotateYValue = -mouseX * 10;

      if (ref.current) {
        const newTransform = `rotateX(${rotateXValue}deg) rotateY(${rotateYValue}deg)`;
        ref.current.style.transform = newTransform;
      }
    };

    const element = ref.current;
    if (element) {
      element.addEventListener("mouseenter", handleMouseEnter);
      element.addEventListener("mouseleave", handleMouseLeave);
      element.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (element) {
        element.removeEventListener("mouseenter", handleMouseEnter);
        element.removeEventListener("mouseleave", handleMouseLeave);
        element.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={cn("w-fit transition duration-200 ease-linear", className)}
      style={{
        transform: `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}; 