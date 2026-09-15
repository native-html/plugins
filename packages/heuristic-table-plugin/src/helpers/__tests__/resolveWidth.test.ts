import {
  clampWidth,
  lesserBound,
  resolveAttributeLength,
  resolveAttributeSize,
  resolveCssSize,
  resolvePercentage
} from '../resolveWidth';

describe('resolveCssSize', () => {
  it.each([
    [200, 200],
    [0, 0],
    [12.5, 12.5]
  ])('should pass the absolute length %s through', (value, expected) => {
    expect(resolveCssSize(value, 400)).toBe(expected);
  });

  it.each([-1, NaN, Infinity, -Infinity])(
    'should reject the unusable number %s',
    (value) => {
      // A width that cannot be laid out must not reach the column solver as a
      // constraint: a negative one would shrink a column below its content and
      // a non-finite one would poison every sum it takes part in.
      expect(resolveCssSize(value, 400)).toBeNull();
    }
  );

  it.each([
    ['50%', 200],
    ['12.5%', 50],
    ['0%', 0],
    ['  25%  ', 100]
  ])('should resolve %s against the containing block', (value, expected) => {
    expect(resolveCssSize(value, 400)).toBe(expected);
  });

  it.each(['auto', '10em', '20px', '%', 'NaN%', '', 'inherit'])(
    'should reject the unresolvable string %s',
    (value) => {
      // Lengths reach the plugin already converted to numbers, so a string
      // that is not a percentage carries no width this pass can use.
      expect(resolveCssSize(value, 400)).toBeNull();
    }
  );

  it.each([undefined, null, {}, []])(
    'should reject the non-size value %s',
    (value) => {
      expect(resolveCssSize(value, 400)).toBeNull();
    }
  );
});

describe('resolvePercentage', () => {
  it('should return a ratio rather than a resolved length', () => {
    expect(resolvePercentage('25%')).toBe(0.25);
  });

  it.each([200, 'auto', '200', undefined])(
    'should report no ratio for %s',
    (value) => {
      expect(resolvePercentage(value)).toBeNull();
    }
  );
});

describe('resolveAttributeLength', () => {
  it.each([
    ['200', 200],
    ['0', 0],
    [' 42 ', 42]
  ])('should read the unitless attribute %s', (value, expected) => {
    expect(resolveAttributeLength(value)).toBe(expected);
  });

  it.each(['50%', '200px', 'abc', '-5', ''])(
    'should refuse the attribute %s, which is not a bare number',
    (value) => {
      expect(resolveAttributeLength(value)).toBeNull();
    }
  );
});

describe('resolveAttributeSize', () => {
  it('should resolve a percentage attribute against the containing block', () => {
    expect(resolveAttributeSize('50%', 400)).toBe(200);
  });

  it('should fall back to the unitless form', () => {
    expect(resolveAttributeSize('200', 400)).toBe(200);
  });

  it.each(['abc', '200px', 42])('should refuse %s', (value) => {
    expect(resolveAttributeSize(value, 400)).toBeNull();
  });
});

describe('clampWidth', () => {
  it('should leave a width inside both bounds alone', () => {
    expect(clampWidth(150, 100, 200)).toBe(150);
  });

  it('should cut a width down to its maximum', () => {
    expect(clampWidth(300, null, 200)).toBe(200);
  });

  it('should raise a width up to its minimum', () => {
    expect(clampWidth(50, 100, null)).toBe(100);
  });

  it('should let the minimum win over a smaller maximum', () => {
    // CSS applies `max-width` first and `min-width` second, so a floor above
    // the ceiling wins — the order of the two clamps is the whole behaviour.
    expect(clampWidth(150, 200, 100)).toBe(200);
  });

  it('should pass a width through when neither bound is declared', () => {
    expect(clampWidth(150, null, null)).toBe(150);
  });
});

describe('lesserBound', () => {
  it.each([
    [100, 200, 100],
    [200, 100, 100],
    [null, 200, 200],
    [100, null, 100],
    [null, null, null]
  ])('should take the stricter of %s and %s', (a, b, expected) => {
    expect(lesserBound(a, b)).toBe(expected);
  });
});
