import linkPressTargetToOnDOMLinkPressArgs from '../linkPressTargetToOnDOMLinkPressArgs';

describe('linkPressTargetToOnDOMLinkPressArgs', () => {
  it('should transform all attributes', () => {
    const expectedOutput: ReturnType<
      typeof linkPressTargetToOnDOMLinkPressArgs
    > = [
      { nativeEvent: {} } as any,
      'https://google.com/',
      {
        class: 'link',
        href: 'https://google.com/',
        hreflang: 'en',
        id: 'anchor03',
        target: '_blank',
        data: { custom: 'data' }
      },
      '_blank'
    ];
    expect(
      linkPressTargetToOnDOMLinkPressArgs({
        classAttribute: 'link',
        clickedAnchorBoundingRect: {} as any,
        downloadAttribute: null,
        hrefAttribute: 'https://google.com/',
        hreflangAttribute: 'en',
        idAttribute: 'anchor03',
        scheme: 'https',
        page: {} as any,
        nameAttribute: null,
        referrerpolicyAttribute: null,
        relAttribute: null,
        targetAttribute: '_blank',
        typeAttribute: null,
        uri: 'https://google.com/',
        dataAttributes: { custom: 'data' }
      })
    ).toEqual(expectedOutput);
  });
});
