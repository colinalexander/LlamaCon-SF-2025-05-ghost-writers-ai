"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Menu, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  promoBanner: {
    enabled: boolean;
    text: string;
    link: string;
    backgroundColor: string;
    textColor: string;
  };
  menuItems: string[];
  logo: string;
}

export default function Header({ promoBanner, menuItems, logo }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(promoBanner.enabled);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {isBannerVisible && promoBanner.enabled && (
        <div
          className={cn(
            promoBanner.backgroundColor,
            promoBanner.textColor,
            "p-2 text-center relative transition-all duration-300"
          )}
        >
          <a href={promoBanner.link} className="hover:underline">
            {promoBanner.text}
          </a>
          <button
            onClick={() => setIsBannerVisible(false)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-current"
            aria-label="Close banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 ease-in-out",
          isScrolled
            ? "bg-white/95 backdrop-blur-sm shadow-sm dark:bg-gray-900/95"
            : "bg-transparent"
        )}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              {logo ? (
                <img
                  src={logo}
                  alt="Ghost-Writers.AI Logo"
                  className="h-8 w-auto"
                />
              ) : (
                <div className="flex items-center space-x-2 text-primary font-semibold text-xl">
                  <PenLine className="h-6 w-6" />
                  <span>Ghost-Writers.AI</span>
                </div>
              )}
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {menuItems.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </a>
              ))}
              <Button className="bg-primary text-white hover:bg-primary/90">
                Sign In
              </Button>
            </nav>
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {menuItems.map((item, index) => (
                    <a
                      key={index}
                      href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  ))}
                  <Button className="mt-4 w-full bg-primary text-white hover:bg-primary/90">
                    Sign In
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}