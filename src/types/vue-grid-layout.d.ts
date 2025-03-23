declare module 'vue-grid-layout' {
  import { DefineComponent } from 'vue';

  export const GridLayout: DefineComponent<{
    layout: Array<{
      i: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }>;
    colNum?: number;
    rowHeight?: number;
    isDraggable?: boolean;
    isResizable?: boolean;
    verticalCompact?: boolean;
    margin?: [number, number];
    useCssTransforms?: boolean;
  }>;

  export const GridItem: DefineComponent<{
    i: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }>;
}