import { RenderersProps } from 'react-native-render-html';
import { LinkPressTarget } from '@formidable-webview/webshell';

/**
 * This function converts an "click event" from webshell to an array of
 * arguments for `onLinkPress` callback from react-native-render-html.
 *
 * @param param0 - The event from webshell
 * @public
 */
export default function linkPressTargetToOnDOMLinkPressArgs({
  uri,
  classAttribute,
  downloadAttribute,
  hrefAttribute,
  hreflangAttribute,
  targetAttribute,
  idAttribute,
  nameAttribute,
  referrerpolicyAttribute,
  relAttribute,
  typeAttribute,
  dataAttributes
}: LinkPressTarget): Parameters<Required<RenderersProps['a']>['onPress']> {
  const attributes = {
    class: classAttribute,
    download: downloadAttribute,
    href: hrefAttribute,
    hreflang: hreflangAttribute,
    id: idAttribute,
    name: nameAttribute,
    referrerpolicy: referrerpolicyAttribute,
    rel: relAttribute,
    type: typeAttribute,
    target: targetAttribute,
    data: dataAttributes
  };
  for (const name in attributes) {
    if (attributes[name] == null) {
      delete attributes[name];
    }
  }
  return [
    { nativeEvent: {} } as any,
    uri,
    attributes as any,
    (targetAttribute as any) || '_self'
  ];
}
