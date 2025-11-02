import { describe, it, expect } from "vitest";
import {
  fadeSlideUp,
  panelSlide,
  staggerContainer,
  cardHover,
  bounceAnimation,
  springPhysics,
  easings,
} from "../animations";

describe("animations", () => {
  describe("fadeSlideUp", () => {
    it("should have initial state with opacity 0 and y 20", () => {
      expect(fadeSlideUp["initial"]).toEqual({
        opacity: 0,
        y: 20,
      });
    });

    it("should animate to opacity 1 and y 0", () => {
      expect(fadeSlideUp["animate"]).toMatchObject({
        opacity: 1,
        y: 0,
      });
    });

    it("should have 300ms duration transition", () => {
      expect(fadeSlideUp["animate"]).toMatchObject({
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      });
    });

    it("should have exit animation", () => {
      expect(fadeSlideUp["exit"]).toMatchObject({
        opacity: 0,
        y: -20,
      });
    });
  });

  describe("panelSlide", () => {
    it("should have initial state with x -300 and opacity 0", () => {
      expect(panelSlide["initial"]).toEqual({
        x: -300,
        opacity: 0,
      });
    });

    it("should animate to x 0 and opacity 1", () => {
      expect(panelSlide["animate"]).toMatchObject({
        x: 0,
        opacity: 1,
      });
    });

    it("should use spring physics with stiffness 300 and damping 30", () => {
      expect(panelSlide["animate"]).toMatchObject({
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      });
    });

    it("should have exit animation with spring physics", () => {
      expect(panelSlide["exit"]).toMatchObject({
        x: -300,
        opacity: 0,
        transition: {
          type: "spring",
          stiffness: 300,
          damping: 30,
        },
      });
    });
  });

  describe("staggerContainer", () => {
    it("should have staggerChildren of 0.1 seconds", () => {
      expect(staggerContainer["animate"]).toMatchObject({
        transition: {
          staggerChildren: 0.1,
        },
      });
    });

    it("should have empty initial state", () => {
      expect(staggerContainer["initial"]).toEqual({});
    });
  });

  describe("cardHover", () => {
    it("should scale to 1.02 on hover", () => {
      expect(cardHover["hover"]).toMatchObject({
        scale: 1.02,
      });
    });

    it("should add box shadow on hover", () => {
      expect(cardHover["hover"]).toHaveProperty("boxShadow");
      const hoverVariant = cardHover["hover"] as Record<string, unknown>;
      expect(hoverVariant["boxShadow"]).toBeTruthy();
    });

    it("should have 200ms transition duration", () => {
      expect(cardHover["hover"]).toMatchObject({
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      });
    });
  });

  describe("bounceAnimation", () => {
    it("should have initial y position of 0", () => {
      expect(bounceAnimation["initial"]).toEqual({
        y: 0,
      });
    });

    it("should animate y with keyframes [0, -10, 0]", () => {
      expect(bounceAnimation["animate"]).toMatchObject({
        y: [0, -10, 0],
      });
    });

    it("should repeat infinitely", () => {
      expect(bounceAnimation["animate"]).toMatchObject({
        transition: {
          repeat: Infinity,
        },
      });
    });

    it("should have 600ms duration", () => {
      expect(bounceAnimation["animate"]).toMatchObject({
        transition: {
          duration: 0.6,
          ease: "easeInOut",
        },
      });
    });

    it("should have no repeat delay", () => {
      expect(bounceAnimation["animate"]).toMatchObject({
        transition: {
          repeatDelay: 0,
        },
      });
    });
  });

  describe("springPhysics", () => {
    it("should have natural spring preset", () => {
      expect(springPhysics.natural).toEqual({
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    });

    it("should have soft spring preset", () => {
      expect(springPhysics.soft).toEqual({
        type: "spring",
        stiffness: 200,
        damping: 25,
      });
    });

    it("should have bouncy spring preset", () => {
      expect(springPhysics.bouncy).toEqual({
        type: "spring",
        stiffness: 400,
        damping: 20,
      });
    });
  });

  describe("easings", () => {
    it("should have easeOut curve", () => {
      expect(easings.easeOut).toEqual([0.4, 0, 0.2, 1]);
    });

    it("should have easeIn curve", () => {
      expect(easings.easeIn).toEqual([0.4, 0, 1, 1]);
    });

    it("should have easeInOut curve", () => {
      expect(easings.easeInOut).toEqual([0.4, 0, 0.2, 1]);
    });

    it("should have smooth curve", () => {
      expect(easings.smooth).toEqual([0.43, 0.13, 0.23, 0.96]);
    });
  });

  describe("GPU acceleration", () => {
    it("fadeSlideUp should only animate transform and opacity", () => {
      const animatedProps = Object.keys(fadeSlideUp["animate"] || {}).filter(
        (key) => key !== "transition"
      );
      const gpuProps = ["opacity", "y", "x", "scale", "rotate"];
      animatedProps.forEach((prop) => {
        expect(gpuProps).toContain(prop);
      });
    });

    it("panelSlide should only animate transform and opacity", () => {
      const animatedProps = Object.keys(panelSlide["animate"] || {}).filter(
        (key) => key !== "transition"
      );
      const gpuProps = ["opacity", "y", "x", "scale", "rotate"];
      animatedProps.forEach((prop) => {
        expect(gpuProps).toContain(prop);
      });
    });
  });
});
