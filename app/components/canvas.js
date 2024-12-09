"use client";

import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from "react";
import { Canvas, Rect } from "fabric";
import { useToolContext } from "@/context/tool-context";

export const CanvasEditor = memo(
  forwardRef(({}, ref) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const isDrawingRef = useRef(null);
    const rectangleRef = useRef(null);

    const { state, dispatch } = useToolContext();

    const { canvas, objectInfo } = state;

    useImperativeHandle(ref, () => ({}));

    const updateObjectInfo = (event) => {
      const activeObject = event.target;
      if (!activeObject) return;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const objectWidth = activeObject.width * activeObject.scaleX;
      const objectHeight = activeObject.height * activeObject.scaleY;

      let left = activeObject.left;
      let top = activeObject.top;

      if (left < 0) left = 0;
      if (top < 0) top = 0;
      if (left + objectWidth > canvasWidth) left = canvasWidth - objectWidth;
      if (top + objectHeight > canvasHeight) top = canvasHeight - objectHeight;

      activeObject.left = left;
      activeObject.top = top;

      dispatch({
        type: "UPDATE_CURRENT_OBJECT",
        objectInfor: {
          ...objectInfo,
          bgWidth: canvasWidth,
          bgHeight: canvasHeight,
          width: objectWidth,
          height: objectHeight,
          scaleX: activeObject.scaleX,
          scaleY: activeObject.scaleY,
          angle: activeObject.angle,
          left: activeObject.left,
          top: activeObject.top,
        },
      });

      canvas.renderAll();
    };

    const handleDeleteSelectedObject = () => {
      const activeObject = canvas.getActiveObject();

      if (activeObject) {
        canvas.remove(activeObject);
        canvas.discardActiveObject();
        canvas.renderAll();
      }

      dispatch({ type: "UPDATE_NUMBER_ICON", numberIcon: canvas?.getObjects().length });
    };

    useEffect(() => {
      const handleKeyDown = (event) => {
        if (event.key === "Delete" || event.key === "Backspace") {
          handleDeleteSelectedObject();
        }
      };

      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [canvas, handleDeleteSelectedObject]);

    useEffect(() => {
      const canvas = new Canvas(canvasRef.current, { backgroundColor: "white" });

      dispatch({ type: "INITIAL_CANVAS", canvas });

      return () => canvas.dispose();
    }, [canvasRef, dispatch]);

    useEffect(() => {
      if (!canvas) return;
      canvas.on("object:moving", updateObjectInfo);
      canvas.on("object:scaling", updateObjectInfo);
      canvas.on("object:rotating", updateObjectInfo);
      return () => {
        canvas.off("object:moving", updateObjectInfo);
        canvas.off("object:scaling", updateObjectInfo);
        canvas.off("object:rotating", updateObjectInfo);
      };
    }, [canvas, updateObjectInfo]);

    useEffect(() => {
      if (!canvas) return;

      const startDrawing = (event) => {
        if (event.target) {
          return;
        }

        canvas
          .getObjects()
          .filter((obj) => obj.type === "rect")
          .forEach((rect) => canvas.remove(rect));

        isDrawingRef.current = true;
        const pointer = canvas.getPointer(event.e);
        const rect = new Rect({
          left: pointer.x,
          top: pointer.y,
          width: 0,
          height: 0,
          fill: "rgba(0, 0, 255, 0.3)",
          stroke: "blue",
          strokeWidth: 2,
          selectable: false,
        });
        rectangleRef.current = rect;
        canvas.add(rect);
      };

      const drawRectangle = (event) => {
        if (!isDrawingRef.current || !rectangleRef.current) return;

        const pointer = canvas.getPointer(event.e);
        const rect = rectangleRef.current;
        const width = pointer.x - rect.left;
        const height = pointer.y - rect.top;

        rect.set({
          width: Math.abs(width),
          height: Math.abs(height),
          left: width < 0 ? pointer.x : rect.left,
          top: height < 0 ? pointer.y : rect.top,
        });
        rect.setCoords();
        canvas.renderAll();
      };

      const endDrawing = () => {
        isDrawingRef.current = false;
        if (rectangleRef.current) {
          rectangleRef.current.set({ selectable: true });

          updateObjectInfo({ target: rectangleRef.current });

          rectangleRef.current = null;
        }
      };

      canvas.on("mouse:down", startDrawing);
      canvas.on("mouse:move", drawRectangle);
      canvas.on("mouse:up", endDrawing);

      return () => {
        if (canvas) {
          canvas.off("mouse:down", startDrawing);
          canvas.off("mouse:move", drawRectangle);
          canvas.off("mouse:up", endDrawing);
        }
      };
    }, [canvas]);

    useEffect(() => {
      if (!containerRef.current) return;

      dispatch({
        type: "SET_CONTAINER_DEMISSION",
        containerDemission: { width: containerRef.current.clientWidth, height: containerRef.current.clientHeight },
      });
    }, [containerRef]);

    return (
      <main className="flex-1 p-4 bg-gray-200">
        <div
          className="flex items-center justify-center h-full bg-white border-2 border-gray-400 border-dashed rounded-lg shadow-sm"
          ref={containerRef}
        >
          <canvas id="canvas" className="w-full h-full" ref={canvasRef}></canvas>
        </div>
      </main>
    );
  })
);
