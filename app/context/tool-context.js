"use client";

import { createContext, useContext, useMemo, useReducer } from "react";

export const ToolContext = createContext({});

export const toolReducer = (state, action) => {
  switch (action.type) {
    case "INITIAL_CANVAS":
      return { ...state, canvas: action.canvas };
    case "UPDATE_CURRENT_OBJECT":
      return { ...state, objectInfor: { ...action.objectInfor } };
    case "UPDATE_NUMBER_ICON":
      return {
        ...state,
        numberIcon: action.numberIcon,
        objectInfor:
          action.numberIcon === 0
            ? {
                bgWidth: 0,
                bgHeight: 0,
                width: 0,
                height: 0,
                scaleX: 1,
                scaleY: 1,
                angle: 0,
                left: 0,
                top: 0,
              }
            : { ...state.objectInfor },
      };
    case "ADD_ICON":
      return {
        ...state,
        iconList: [...state.iconList, ...action.newIcons],
      };
    case "REMOVE_ICON":
      return {
        ...state,
        iconList: [...state.iconList.filter((icon) => icon.id !== action.iconId)],
      };
    case "SET_CONTAINER_DEMISSION":
      return {
        ...state,
        containerDemission: action.containerDemission,
      };
    case "SAVE_OBJECT_INFORMATION":
      return {
        ...state,
        fixedObjectInfor: !action.fixedObjectInfor ? null : { ...action.fixedObjectInfor },
      };
    default:
      return state;
  }
};

const initialValue = {
  objectInfor: {
    bgWidth: 0,
    bgHeight: 0,
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    left: 0,
    top: 0,
  },
  fixedObjectInfor: null,
  canvas: null,
  numberIcon: 0,
  iconList: [],
  containerDemission: {
    width: 0,
    height: 0,
  },
};

export const ToolProvider = ({ children }) => {
  const [state, dispatch] = useReducer(toolReducer, initialValue);

  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return <ToolContext.Provider value={contextValue}>{children}</ToolContext.Provider>;
};

export const useToolContext = () => {
  return useContext(ToolContext);
};
