import React from 'react';
import HTML from 'react-native-render-html';
import iframe from '@native-html/iframe-plugin';
import WebView from 'react-native-webview';

const htmlConfig = {
  renderers: {
    iframe
  },
  tagsStyles: {
    iframe: {
      alignSelf: 'center'
    }
  },
  WebView
};

const youtubeIframe = `
<p>
<iframe width="560"
        height="315"
        src="https://www.youtube.com/embed/POK_Iw4m3fY"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
</iframe>
</p>
<p>This is a paragraph.</p>
`;

export default function YoutubeExample({
  instance,
  onLinkPress,
  availableWidth,
  scalesPageToFit = true
}) {
  return (
    <HTML
      key={`youtube-${instance}`}
      contentWidth={availableWidth}
      source={{ html: youtubeIframe }}
      onLinkPress={onLinkPress}
      {...htmlConfig}
      renderersProps={{
        iframe: {
          scalesPageToFit
        }
      }}
    />
  );
}
