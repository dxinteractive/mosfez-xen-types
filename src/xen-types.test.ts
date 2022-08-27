import { cents, Cents, ed2, Ed2, ratio, Ratio, parse } from "./xen-types";

describe("ratio", () => {
  it("should make ratio", () => {
    expect(ratio(3, 2) instanceof Ratio).toBe(true);
  });

  it("should make ratio from numbers", () => {
    expect(ratio(3, 2).value).toEqual([3, 2]);
  });

  it("should return ratio as string", () => {
    expect(`${ratio(3, 2)}`).toBe("3/2");
  });

  it("should return ratio as scl format string", () => {
    expect(ratio(3, 2).toScl()).toBe("3/2");
  });

  it("should return ratio as multiplier", () => {
    expect(ratio(4, 2).toMultiplier()).toBe(2);
  });

  it("should pass through Ratio", () => {
    const r = ratio(3, 2);
    expect(r).toBe(ratio(r));
  });

  describe("parse", () => {
    it("should make ratio from string", () => {
      expect(ratio("3/2").value).toEqual([3, 2]);
    });

    it("should make ratio from string with decimals", () => {
      expect(ratio("3.5/2").value).toEqual([3.5, 2]);
    });

    it("should ignore leading or trailing whitespace", () => {
      expect(ratio(" 3/2   ").value).toEqual([3, 2]);
    });

    it("should allow single digit ratios", () => {
      expect(ratio("3").value).toEqual([3, 1]);
    });

    it("should error if wrong number of slashes", () => {
      expect(() => ratio("3/3/5").value).toThrow(
        `ratio "3/3/5" must contain a single slash (/)`
      );
    });

    it("should error if not a number", () => {
      expect(() => ratio("4/pppp").value).toThrow(`"pppp" is not a number`);
    });
  });
});

describe("ed2", () => {
  it("should make ed2", () => {
    expect(ed2(7, 12) instanceof Ed2).toBe(true);
  });

  it("should make ed2 from numbers", () => {
    expect(ed2(7, 12).value).toEqual([7, 12]);
  });

  it("should return ed2 as string", () => {
    expect(`${ed2(7, 12)}`).toBe("7\\12");
  });

  it("should return ed2 as scl format string", () => {
    expect(ed2(7, 12).toScl(3)).toBe("700.");
  });

  it("should pass through Ed2", () => {
    const r = ed2(7, 12);
    expect(r).toBe(ed2(r));
  });

  it("should return multiplier", () => {
    expect(ed2(7, 12).toMultiplier()).toBe(1.4983070768766815);
  });

  describe("parse", () => {
    it("should make ed2 from string", () => {
      expect(ed2("7\\12").value).toEqual([7, 12]);
    });

    it("should make ed2 from string with decimals", () => {
      expect(ed2("7.5\\12").value).toEqual([7.5, 12]);
    });

    it("should ignore leading or trailing whitespace", () => {
      expect(ed2(" 7\\12   ").value).toEqual([7, 12]);
    });

    it("should error if wrong number of slashes", () => {
      expect(() => ed2("32").value).toThrow(
        `ed2 "32" must contain a single backslash (\\)`
      );
    });

    it("should error if not a number", () => {
      expect(() => ed2("4\\pppp").value).toThrow(`"pppp" is not a number`);
    });
  });
});

describe("cents", () => {
  it("should make cents", () => {
    expect(cents(200) instanceof Cents).toBe(true);
  });

  it("should make cents from number", () => {
    expect(cents(200).value).toBe(200);
  });

  it("should make cents from ed2", () => {
    expect(cents(ed2(7, 12)).value).toBe(700);
  });

  it("should make cents from ratio", () => {
    expect(cents(ratio(3, 2)).toDecimal(2)).toBeCloseTo(701.96);
  });

  it("should return cents as string", () => {
    expect(`${cents(200)}`).toBe("200c");
  });

  it("should return cents as decimal places", () => {
    expect(cents(543.21).toDecimal(3)).toBe(543.21);
    expect(cents(543.21).toDecimal(2)).toBe(543.21);
    expect(cents(543.21).toDecimal(1)).toBe(543.2);
    expect(cents(543.21).toDecimal(0)).toBe(543);
    expect(cents(99.9).toDecimal(1)).toBe(99.9);
    expect(cents(100).toDecimal(1)).toBe(100);
  });

  it("should return cents as string with decimal places", () => {
    expect(cents(543.21).toDecimalString(3)).toBe("543.21c");
    expect(cents(543.21).toDecimalString(2)).toBe("543.21c");
    expect(cents(543.21).toDecimalString(1)).toBe("543.2c");
    expect(cents(543.21).toDecimalString(0)).toBe("543c");
    expect(cents(99.9).toDecimalString(1)).toBe("99.9c");
    expect(cents(99.9).toDecimalString(0)).toBe("100c");
    expect(cents(100).toDecimalString(1)).toBe("100c");
    expect(cents(100).toDecimalString(0)).toBe("100c");
  });

  it("should return cents as scl-format string with decimal places", () => {
    expect(cents(543.21).toScl(3)).toBe("543.21");
    expect(cents(543.21).toScl(2)).toBe("543.21");
    expect(cents(543.21).toScl(1)).toBe("543.2");
    expect(cents(543.21).toScl(0)).toBe("543.");
    expect(cents(99.9).toScl(1)).toBe("99.9");
    expect(cents(99.9).toScl(0)).toBe("100.");
    expect(cents(100).toScl(1)).toBe("100.");
    expect(cents(100).toScl(0)).toBe("100.");
  });

  it("should return cents as multiplier", () => {
    expect(cents(0).toMultiplier()).toBe(1);
    expect(cents(1200).toMultiplier()).toBe(2);
    expect(cents(702).toMultiplier()).toBe(1.5000389892858181);
  });

  it("should pass through Cents", () => {
    const c = cents(200);
    expect(c).toBe(cents(c));
  });

  describe("parse", () => {
    it("should make cents from string", () => {
      expect(cents("200").value).toBe(200);
    });

    it("should make cents from scl format string", () => {
      expect(cents("200.").value).toBe(200);
    });

    it("should make cents from decimal string", () => {
      expect(cents("200.4").value).toBe(200.4);
    });

    it("should make cents from string with c", () => {
      expect(cents("200.4c").value).toBe(200.4);
    });

    it("should error if not a number", () => {
      expect(() => cents("pppp").value).toThrow(`"pppp" is not a number`);
    });
  });
});

describe("parse", () => {
  it("should parse a ratio", () => {
    expect(parse(`13/11`) instanceof Ratio).toBe(true);
  });

  it("should parse a single digit ratio", () => {
    console.log("parse(`2`)", parse(`2`));
    expect(parse(`2`) instanceof Ratio).toBe(true);
  });

  it("should fail to parse a ratio", () => {
    expect(parse(`123aas`)).toBe("invalid");
  });

  it("should parse an ed2", () => {
    expect(parse(`2\\12`) instanceof Ed2).toBe(true);
  });

  it("should fail to parse an ed2", () => {
    expect(parse(`2\\19aaaaa`)).toBe("invalid");
  });

  it("should parse cents", () => {
    expect(parse(`12.`) instanceof Cents).toBe(true);
  });

  it("should parse cents", () => {
    expect(parse(`12c`) instanceof Cents).toBe(true);
  });

  it("should fail to parse cents", () => {
    expect(parse(`c`)).toBe("invalid");
  });

  it("should fail to parse cents", () => {
    expect(parse(`abc`)).toBe("invalid");
  });

  it("should ignore empty", () => {
    expect(parse(` `)).toBe("ignore");
  });

  it("should ignore exclamation mark", () => {
    expect(parse(`! thing`)).toBe("ignore");
  });

  it("should ignore hash mark", () => {
    expect(parse(`# thing`)).toBe("ignore");
  });
});
