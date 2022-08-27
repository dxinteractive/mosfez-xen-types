//
// internal predicates
//

export const isNumber = (input: unknown): input is number =>
  typeof input === "number";

export const isString = (input: unknown): input is string =>
  typeof input === "string";

//
// type conversions
//

export const stringToNumber = (str: string): number => {
  const result = Number(str);
  if (isNaN(result) || str === "") {
    throw new Error(`"${str}" is not a number`);
  }
  return result;
};

//
// utils
//

export const toDecimal = (value: number, places: number): number => {
  const m = 10 ** places;
  return Math.round(value * m) / m;
};

export const toDecimalString = (value: number, places: number): string => {
  return `${toDecimal(value, places)}`.replace(/(?:\.0+|(\.\d+?)0+)$/, "$1");
};

//
// xen types
//

export class Cents {
  public value = 0;

  constructor(cents: number);
  constructor(stringToParse: string);
  constructor(ratio: Ratio);
  constructor(ed2: Ed2);
  constructor(input: number | string | Ratio | Ed2) {
    if (isNumber(input)) {
      this.value = input;
    } else if (isString(input)) {
      this.value = Cents.parse(input);
    } else if (input instanceof Ed2) {
      this.value = Cents.fromEd2(input);
    } else if (input instanceof Ratio) {
      this.value = Cents.fromRatio(input);
    }
  }

  static parse(str: string): number {
    const trimmed = str.trim().replace(/c$/g, "");
    return stringToNumber(trimmed);
  }

  static fromEd2(ed2: Ed2): number {
    return Math.log2(ed2.toMultiplier()) * 1200;
  }

  static fromRatio(ratio: Ratio): number {
    return Math.log2(ratio.numerator / ratio.denominator) * 1200;
  }

  toString(): string {
    return `${this.value}c`;
  }

  toDecimal(places: number): number {
    return toDecimal(this.value, places);
  }

  toDecimalString(places: number): string {
    return `${toDecimalString(this.value, places)}c`;
  }

  toScl(places: number): string {
    const str = toDecimalString(this.value, places);
    return str.indexOf(".") === -1 ? `${str}.` : str;
  }

  toMultiplier(): number {
    return 2 ** (this.value / 1200);
  }
}

export class Ratio {
  public numerator = 1;
  public denominator = 1;

  constructor(numerator: number, denominator: number);
  constructor(stringToParse: string);
  constructor(a: string | number, b?: number) {
    if (isNumber(a) || b !== undefined) {
      this.numerator = a as number;
      this.denominator = b as number;
    } else {
      const [n, d] = Ratio.parse(a);
      this.numerator = n;
      this.denominator = d;
    }
  }

  static parse(str: string): [number, number] {
    const split = str.trim().split("/");
    if (split.length > 2)
      throw new Error(`ratio "${str}" must contain a single slash (/)`);
    const n = stringToNumber(split[0]);
    const d = split.length > 1 ? stringToNumber(split[1]) : 1;
    return [n, d];
  }

  get value(): [number, number] {
    return [this.numerator, this.denominator];
  }

  toMultiplier(): number {
    return this.numerator / this.denominator;
  }

  toString(): string {
    return `${this.numerator}/${this.denominator}`;
  }

  toScl(): string {
    return this.toString();
  }
}

export class Ed2 {
  public steps = 1;
  public divisions = 1;

  constructor(steps: number, divisions: number);
  constructor(stringToParse: string);
  constructor(a: string | number, b?: number) {
    if (isNumber(a) || b !== undefined) {
      this.steps = a as number;
      this.divisions = b as number;
    } else {
      const [s, d] = Ed2.parse(a);
      this.steps = s;
      this.divisions = d;
    }
  }

  static parse(str: string): [number, number] {
    const split = str.trim().split("\\");
    if (split.length !== 2)
      throw new Error(`ed2 "${str}" must contain a single backslash (\\)`);
    const s = stringToNumber(split[0]);
    const d = stringToNumber(split[1]);
    return [s, d];
  }

  get value(): [number, number] {
    return [this.steps, this.divisions];
  }

  toString(): string {
    return `${this.steps}\\${this.divisions}`;
  }

  toScl(places: number) {
    return cents(this).toScl(places);
  }

  toMultiplier(): number {
    return 2 ** (this.steps / this.divisions);
  }
}

export type Pitch = Cents | Ratio | Ed2;

export function cents(cents: number): Cents;
export function cents(centsInstance: Cents): Cents;
export function cents(stringToParse: string): Cents;
export function cents(ratio: Ratio): Cents;
export function cents(ed2: Ed2): Cents;
export function cents(a: number | string | Ratio | Ed2 | Cents): Cents {
  if (a instanceof Cents) return a;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Cents(a);
}

export function ratio(ratio: Ratio): Ratio;
export function ratio(stringToParse: string): Ratio;
export function ratio(numerator: number, denominator: number): Ratio;
export function ratio(a: Ratio | string | number | Ed2, b?: number): Ratio {
  if (a instanceof Ratio) return a;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Ratio(a, b);
}

export function ed2(ed2: Ed2): Ed2;
export function ed2(stringToParse: string): Ed2;
export function ed2(steps: number, divisions: number): Ed2;
export function ed2(a: Ed2 | string | number, b?: number): Ed2 {
  if (a instanceof Ed2) return a;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Ed2(a, b);
}
//
// parsing
//

export const parse = (input: string): Pitch | "ignore" | "invalid" => {
  input = input.trim();

  const catchAndError = (cb: () => Pitch) => {
    try {
      return cb();
    } catch (e) {
      return "invalid";
    }
  };

  if (input === "" || "!#".indexOf(input[0]) !== -1) {
    return "ignore";
  }

  if (input.indexOf("\\") !== -1) {
    return catchAndError(() => ed2(input));
  }

  if (input.indexOf(".") !== -1 || input.slice(-1) === "c") {
    return catchAndError(() => cents(input));
  }

  return catchAndError(() => ratio(input));
};
