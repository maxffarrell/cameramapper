import { SvelteComponentTyped } from 'svelte';

export class Primitive extends SvelteComponentTyped<any> {}

export namespace Select {
  class Root extends Primitive {}
  class Trigger extends Primitive {}
  class Value extends Primitive {}
  class Content extends Primitive {}
  class Item extends Primitive {}
  class Group extends Primitive {}
  class GroupHeading extends Primitive {}
  class Viewport extends Primitive {}
  class ScrollUpButton extends Primitive {}
  class ScrollDownButton extends Primitive {}
  class Separator extends Primitive {}
  class Portal extends Primitive {}
  class Label extends Primitive {}
  export type ItemProps = any;
  export type GroupProps = any;
  export type ContentProps = any;
  export type PortalProps = any;
}

export namespace Tooltip {
  class Root extends Primitive {}
  class Trigger extends Primitive {}
  class Content extends Primitive {}
  class Portal extends Primitive {}
  class Arrow extends Primitive {}
  class Provider extends Primitive {}
  export type ContentProps = any;
}

export namespace Slider {
  class Root extends Primitive {}
  class Track extends Primitive {}
  class Range extends Primitive {}
  class Thumb extends Primitive {}
  export type RootProps = any;
}

export namespace Separator {
  class Root extends Primitive {}
}

export const Select: typeof Select;
export const Tooltip: typeof Tooltip;
export const Slider: typeof Slider;
export const Separator: typeof Separator;
