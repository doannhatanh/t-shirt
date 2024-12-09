"use client";

import { useRef, useState } from "react";
import { CanvasEditor } from "@/components/canvas";
import { ToolProvider, useToolContext } from "@/context/tool-context";
import { IconList } from "./icon-list";

export const Tool = () => {
  const canvasRef = useRef(null);
  const [isUsingSavedObject, setIsUsingSavedObject] = useState(false);

  const { state, dispatch } = useToolContext();

  const { fixedObjectInfor, objectInfor, numberIcon, canvas } = state;

  return (
    <div className="flex flex-col w-full min-h-screen overflow-scroll bg-gray-50">
      {/* Header */}
      <header className="px-6 py-4 text-center text-white bg-blue-500 shadow-md">
        <h1 className="text-2xl font-bold">T-Shirt Design Editor</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:flex-row">
        {/* Toolbar */}
        <aside className="p-4 bg-white shadow md:w-1/4">
          <h2 className="mb-4 text-lg font-bold">Tools</h2>

          <IconList />

          <h3 className="text-black-800 text-md">
            Current Number of icon: <span id="width">{numberIcon}</span>
          </h3>
          {/* 
          <div className="flex items-center mt-3 space-x-2" onClick={() => setIsDrawing((prev) => !prev)}>
            <i className={`text-[2rem] cursor-pointer fi-br-pencil-ruler ${isDrawing ? "text-blue-500" : ""}`}></i>
          </div> */}

          {/* Object Info */}
          <div className="grid grid-flow-row p-4 bg-gray-100 rounded-lg shadow">
            <h3 className="mb-2 font-medium text-gray-700">Current Object Info</h3>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-gray-600">
                X: <span id="width">{Math.round(objectInfor?.left)}</span>
              </p>
              <p className="text-sm text-gray-600">
                Y: <span id="width">{Math.round(objectInfor?.top)}</span>
              </p>
              <p className="text-sm text-gray-600">
                Width: <span id="width">{Math.round(objectInfor?.width)}</span>
              </p>
              <p className="text-sm text-gray-600">
                Height: <span id="height">{Math.round(objectInfor?.height)}</span>
              </p>
              <p className="text-sm text-gray-600">
                Rotation: <span id="rotation">{Math.round(objectInfor?.angle)}</span>°
              </p>
            </div>

            <div className="grid items-center justify-center grid-cols-2 gap-3 mb-4">
              <button
                className={`w-full px-4 py-2 mt-4 text-white ${
                  !fixedObjectInfor ? "bg-blue-500" : "bg-gray-800"
                } rounded-lg shadow`}
                onClick={() => {
                  console.log({ fixedObjectInfor });
                  !fixedObjectInfor && canvas?.getObjects()?.length > 0
                    ? dispatch({ type: "SAVE_OBJECT_INFORMATION", fixedObjectInfor: { ...objectInfor } })
                    : dispatch({ type: "SAVE_OBJECT_INFORMATION", fixedObjectInfor: null });
                }}
                disabled={canvas?.getObjects()?.length === 0 && !fixedObjectInfor}
              >
                {!fixedObjectInfor ? "Save" : "Remove"}
              </button>
            </div>

            {fixedObjectInfor && (
              <div className="flex flex-col gap-2">
                <h3 className="mb-2 font-medium text-gray-700">Saved Object Info</h3>
                <p className="text-sm text-gray-600">
                  X: <span id="width">{Math.round(fixedObjectInfor?.left)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Y: <span id="width">{Math.round(fixedObjectInfor?.top)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Width: <span id="width">{Math.round(fixedObjectInfor?.width)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Height: <span id="height">{Math.round(fixedObjectInfor?.height)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Rotation: <span id="rotation">{Math.round(fixedObjectInfor?.angle)}</span>°
                </p>
              </div>
            )}
          </div>
        </aside>
        <CanvasEditor ref={canvasRef} />
      </div>
    </div>
  );
};
