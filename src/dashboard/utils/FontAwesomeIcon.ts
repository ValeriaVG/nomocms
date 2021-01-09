import { IconDefinition, icon, parse } from "@fortawesome/fontawesome-svg-core";
import { h, Ref } from "preact";

export default function FontAwesomeIcon({
  forwardedRef,
  ...props
}: FontAwesomeIconProps & any) {
  const {
    icon: iconArgs,
    mask: maskArgs,
    symbol,
    className,
    title,
    titleId,
  } = props;

  const iconLookup = normalizeIconArgs(iconArgs);
  const classes = objectWithKey("classes", [
    ...classList(props),
    ...className.split(" "),
  ]);
  const transform = objectWithKey(
    "transform",
    typeof props.transform === "string"
      ? parse.transform(props.transform)
      : props.transform
  );
  const mask = objectWithKey("mask", normalizeIconArgs(maskArgs));
  const renderedIcon = icon(iconLookup, {
    ...classes,
    ...transform,
    ...mask,
    symbol,
    title,
    titleId,
  });

  const { abstract } = renderedIcon;
  const extraProps = { ref: forwardedRef };

  Object.keys(props).forEach((key) => {
    // eslint-disable-next-line no-prototype-builtins
    if (!FontAwesomeIcon.defaultProps.hasOwnProperty(key)) {
      extraProps[key] = props[key];
    }
  });

  return convert(h, abstract[0], extraProps);
}

FontAwesomeIcon.defaultProps = {
  border: false,
  className: "",
  mask: null,
  fixedWidth: false,
  inverse: false,
  flip: null,
  icon: null,
  listItem: false,
  pull: null,
  pulse: false,
  rotation: null,
  size: null,
  spin: false,
  symbol: false,
  title: "",
  transform: null,
  swapOpacity: false,
};

export type FontAwesomeIconProps = { icon: IconDefinition | string } & Partial<{
  border: boolean;

  className: string;

  mask: IconDefinition | string;

  fixedWidth: boolean;

  inverse: boolean;

  flip: "horizontal" | "vertical" | "both";

  listItem: boolean;

  pull: "right" | "left";

  pulse: boolean;

  rotation: 0 | 90 | 180 | 270;

  size:
    | "lg"
    | "xs"
    | "sm"
    | "1x"
    | "2x"
    | "3x"
    | "4x"
    | "5x"
    | "6x"
    | "7x"
    | "8x"
    | "9x"
    | "10x";

  spin: boolean;

  symbol: boolean | string;

  title: string;

  transform: string | object;

  swapOpacity: boolean;
  forwardedRef: Ref<any>;
  titleId: string;
}>;

function normalizeIconArgs(icon) {
  // if the icon is null, there's nothing to do
  if (icon === null) {
    return null;
  }

  // if the icon is an object and has a prefix and an icon name, return it
  if (typeof icon === "object" && icon.prefix && icon.iconName) {
    return icon;
  }

  // if it's an array with length of two
  if (Array.isArray(icon) && icon.length === 2) {
    // use the first item as prefix, second as icon name
    return { prefix: icon[0], iconName: icon[1] };
  }

  // if it's a string, use it as the icon name
  if (typeof icon === "string") {
    return { prefix: "fas", iconName: icon };
  }
}

// creates an object with a key of key
// and a value of value
// if certain conditions are met
function objectWithKey(key, value) {
  // if the value is a non-empty array
  // or it's not an array but it is truthy
  // then create the object with the key and the value
  // if not, return an empty array
  return (Array.isArray(value) && value.length > 0) ||
    (!Array.isArray(value) && value)
    ? { [key]: value }
    : {};
}

// Get CSS class list from a props object
function classList(props) {
  const {
    spin,
    pulse,
    fixedWidth,
    inverse,
    border,
    listItem,
    flip,
    size,
    rotation,
    pull,
  } = props;

  // map of CSS class names to properties
  const classes = {
    "fa-spin": spin,
    "fa-pulse": pulse,
    "fa-fw": fixedWidth,
    "fa-inverse": inverse,
    "fa-border": border,
    "fa-li": listItem,
    "fa-flip-horizontal": flip === "horizontal" || flip === "both",
    "fa-flip-vertical": flip === "vertical" || flip === "both",
    [`fa-${size}`]: typeof size !== "undefined" && size !== null,
    [`fa-rotate-${rotation}`]:
      typeof rotation !== "undefined" && rotation !== null && rotation !== 0,
    [`fa-pull-${pull}`]: typeof pull !== "undefined" && pull !== null,
    "fa-swap-opacity": props.swapOpacity,
  };

  // map over all the keys in the classes object
  // return an array of the keys where the value for the key is not null
  return Object.keys(classes)
    .map((key) => (classes[key] ? key : null))
    .filter((key) => key);
}

function capitalize(val) {
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function styleToObject(style) {
  return style
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s)
    .reduce((acc, pair) => {
      const i = pair.indexOf(":");
      const prop = camelize(pair.slice(0, i));
      const value = pair.slice(i + 1).trim();

      prop.startsWith("webkit")
        ? (acc[capitalize(prop)] = value)
        : (acc[prop] = value);

      return acc;
    }, {});
}

function convert(createElement, element, extraProps = {} as any) {
  if (typeof element === "string") {
    return element;
  }

  const children = (element.children || []).map((child) => {
    return convert(createElement, child);
  });

  /* eslint-disable dot-notation */
  const mixins = Object.keys(element.attributes || {}).reduce(
    (acc, key) => {
      const val = element.attributes[key];

      switch (key) {
        case "class":
          acc.attrs["className"] = val;
          delete element.attributes["class"];
          break;
        case "style":
          acc.attrs["style"] = styleToObject(val);
          break;
        default:
          if (key.indexOf("aria-") === 0 || key.indexOf("data-") === 0) {
            acc.attrs[key.toLowerCase()] = val;
          } else {
            acc.attrs[camelize(key)] = val;
          }
      }

      return acc;
    },
    { attrs: {} }
  );

  const { style: existingStyle = {}, ...remaining } = extraProps;

  mixins.attrs["style"] = { ...mixins.attrs["style"], ...existingStyle };
  /* eslint-enable */

  return createElement(
    element.tag,
    { ...mixins.attrs, ...remaining },
    ...children
  );
}

// Camelize taken from humps
// humps is copyright © 2012+ Dom Christie
// Released under the MIT license.

// Performant way to determine if object coerces to a number
function _isNumerical(obj) {
  obj = obj - 0;

  // eslint-disable-next-line no-self-compare
  return obj === obj;
}

function camelize(string) {
  if (_isNumerical(string)) {
    return string;
  }

  // eslint-disable-next-line no-useless-escape
  string = string.replace(/[\-_\s]+(.)?/g, function (match, chr) {
    return chr ? chr.toUpperCase() : "";
  });

  // Ensure 1st char is always lowercase
  return string.substr(0, 1).toLowerCase() + string.substr(1);
}
