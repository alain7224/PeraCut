import React, { ReactNode } from "react";

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Componente de layout responsivo optimizado para móvil
 * Maneja safe areas y orientación de pantalla
 */
export function ResponsiveLayout({ children, className = "" }: ResponsiveLayoutProps) {
  const [isLandscape, setIsLandscape] = React.useState(
    typeof window !== "undefined" && window.innerWidth > window.innerHeight
  );

  React.useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, []);

  return (
    <div
      className={`min-h-screen w-full overflow-x-hidden ${className}`}
      style={{
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {children}
    </div>
  );
}

/**
 * Hook para detectar si el dispositivo está en modo landscape
 */
export function useIsLandscape(): boolean {
  const [isLandscape, setIsLandscape] = React.useState(
    typeof window !== "undefined" && window.innerWidth > window.innerHeight
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  return isLandscape;
}

/**
 * Hook para detectar si el dispositivo es móvil
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(
    typeof window !== "undefined" && window.innerWidth < 768
  );

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
}

/**
 * Hook para obtener dimensiones de la ventana
 */
export function useWindowDimensions() {
  const [dimensions, setDimensions] = React.useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  React.useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return dimensions;
}
