"use client";

import { useToolContext } from "@/context/tool-context";
import { FabricImage } from "fabric";
import Image from "next/image";
import { forwardRef, memo, useRef } from "react";

export const IconList = memo(
  forwardRef(({}, ref) => {
    const uploadShirtRef = useRef(null);
    const uploadIconRef = useRef(null);

    const { state, dispatch } = useToolContext();

    const { iconList, canvas, containerDemission, fixedObjectInfor } = state;

    const handleImageShirtUpload = (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onload = async (e) => {
        const image = await FabricImage.fromURL(e.target.result);

        const { width, height } = containerDemission;

        const imgWidth = image.width;
        const imgHeight = image.height;

        const scaleX = width / imgWidth;
        const scaleY = height / imgHeight;
        const scale = Math.min(scaleX, scaleY);

        image.scale(scale);

        canvas.setDimensions({ width: image.width * image.scaleX, height: image.height * image.scaleY });

        canvas.backgroundImage = image;

        canvas.renderAll();
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    };

    const processFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
          try {
            const image = await FabricImage.fromURL(event.target.result);
            resolve({
              src: event.target.result,
              id: Date.now() + Math.random(),
              width: image.width,
              height: image.height,
            });
          } catch (err) {
            reject(err);
          }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
    };

    const handleIconShirtUpload = async (e) => {
      const files = Array.from(e.target.files);
      try {
        const newIcons = await Promise.all(files.map(processFile));

        dispatch({ type: "ADD_ICON", newIcons });
      } catch (error) {
        console.error("Error uploading images:", error);
      } finally {
        e.target.value = "";
      }
    };

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

    const handleIconChoose = async (src) => {
      const image = await FabricImage.fromURL(src);
      const id = iconList.length + 1;

      canvas.add(image);

      if (!fixedObjectInfor) {
        image.set({ selectable: true, id });

        image.scaleToWidth(canvas.width / 4);
        canvas.centerObject(image);
      } else {
        const scaleWidthDirection = fixedObjectInfor.width <= fixedObjectInfor.height;
        image.set({
          selectable: true,
          id,
          left: fixedObjectInfor.left,
          top: fixedObjectInfor.top,
          angle: fixedObjectInfor.angle,
        });

        if (scaleWidthDirection) {
          image.scaleToWidth(fixedObjectInfor.width);
        } else {
          image.scaleToHeight(fixedObjectInfor.height);
        }
      }

      canvas.setActiveObject(image);
      canvas.renderAll();

      dispatch({ type: "UPDATE_NUMBER_ICON", numberIcon: canvas?.getObjects().length });
    };

    return (
      <>
        {/* Upload Image */}
        <div className="mb-4">
          <button
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600"
            onClick={() => {
              uploadShirtRef.current.click();
            }}
          >
            Upload Background Image
          </button>
          <input
            type="file"
            id="uploadImage"
            className="hidden"
            onChange={handleImageShirtUpload}
            accept=".png, .jpg, .jpeg"
            ref={uploadShirtRef}
          />
        </div>

        {/* Add Icon */}
        <div className="mb-4">
          <button
            className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg shadow hover:bg-blue-600"
            onClick={() => {
              uploadIconRef.current.click();
            }}
          >
            Add Icon
          </button>
          <input
            type="file"
            id="uploadImage"
            className="hidden"
            onChange={handleIconShirtUpload}
            accept=".png, .jpg, .jpeg"
            ref={uploadIconRef}
            multiple
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {iconList.map(({ src, id }, index) => (
            <div
              className="relative flex items-center justify-center bg-gray-100 border rounded-lg shadow-sm aspect-square"
              key={src}
            >
              <button
                onClick={() => dispatch({ type: "REMOVE_ICON", iconId: id })}
                className="absolute w-[20%] h-[20%] top-[5%] right-[5%] font-[0.8rem] flex items-center justify-center p-1 text-white bg-red-500 rounded-full shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                aria-label="Delete"
              >
                x
              </button>
              <Image
                src={src}
                alt=""
                width={5000}
                height={5000}
                onClick={() => handleIconChoose(src)}
                layout="intrinsic"
                className="cursor-pointer"
              />
            </div>
          ))}
        </div>
      </>
    );
  })
);
