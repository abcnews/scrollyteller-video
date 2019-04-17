# Scrollyteller Video Background

Add a video background to a [scrollyteller](https://www.npmjs.com/package/@abcnews/scrollyteller).

## Usage

Inside a Scrollyteller:

```js
import Video from '@abcnews/scrollyteller-video';

<Scrollyteller {...}>
  <Video src={url} targetTime={number} onTargetTimeReached={() => {}}>
    ... any overlays ...
  </Video>
</Scrollyteller>
```

## Author

- Nathan Hoad - (hoad.nathan@abc.net.au)[mailto:hoad.nathan@abc.net.au]
