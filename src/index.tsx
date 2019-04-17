import * as React from 'react';

interface Props {
  src: string;
  targetTime: number;
}

interface State {
  scale: number;
  targetTime: number;
}

export default class extends React.Component<Props, State> {
  base: HTMLDivElement;
  hasVideoLoaded: boolean;
  video: HTMLVideoElement;
  scale: number;
  interval: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);

    this.calculateScale = this.calculateScale.bind(this);

    this.state = {
      scale: 1,
      targetTime: props.targetTime || 0
    };

    this.hasVideoLoaded = false;
    this.video = document.createElement('video');
    this.video.addEventListener('loadedmetadata', e => {
      this.hasVideoLoaded = true;
    });
    this.video.src = props.src;
  }

  public shouldComponentUpdate() {
    return false;
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (typeof nextProps.targetTime !== 'undefined') {
      this.setState(() => ({
        targetTime: nextProps.targetTime
      }));
    }
  }

  public componentDidMount() {
    window.addEventListener('resize', this.calculateScale);

    // Load the video and then attach it
    const checkLoad = setInterval(() => {
      if (this.hasVideoLoaded) {
        clearInterval(checkLoad);

        this.calculateScale();

        // Attach the video and set up playback handlers
        this.base.appendChild(this.video);
        this.video.msRealTime = true;
        this.video.muted = true;
        this.video.style.setProperty('max-width', 'initial');
        this.interval = setInterval(() => {
          const timeDifference = Math.abs(this.state.targetTime - this.video.currentTime);
          if (timeDifference < 0.2) {
            this.video.pause();
            this.video.currentTime = this.state.targetTime;
          } else {
            if (this.state.targetTime > this.video.currentTime) {
              this.video.play().catch(err => console.log(err)); // If not muted then you get a DOMException trying to play right away
            } else {
              this.video.currentTime -= 0.2;
              this.video.pause();
            }
          }
        }, 100);
      }
    }, 100);
  }

  public componentWillUnmount() {
    window.removeEventListener('resize', this.calculateScale);
    clearInterval(this.interval);

    if (this.base && this.base.contains(this.video)) {
      this.base.removeChild(this.video);
    }
  }

  public calculateScale() {
    if (!this.video.videoWidth) return;

    const width = this.video.videoWidth;
    const height = this.video.videoHeight;

    // Set the base scale
    let scale = window.innerWidth / width;

    if (window.innerHeight > height * scale) {
      scale = window.innerHeight / height;
    }

    if (window.innerWidth > width * scale) {
      scale = (window.innerWidth * scale) / width;
    }

    this.base.style.setProperty('position', 'absolute');
    this.base.style.setProperty('left', '50%');
    this.base.style.setProperty('top', '50%');
    this.base.style.setProperty('transform', `translate(-50%, -50%) scale(${scale})`);
  }

  public render() {
    return <div ref={el => (this.base = el)} style={{ transform: `scale(${this.state.scale})` }} />;
  }
}
