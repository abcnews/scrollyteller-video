import * as React from 'react';

interface Props {
  src: string;
  targetTime: number;
  onVideoLoaded(video: HTMLVideoElement): void;
  onTargetTimeReached(): void;
}

interface State {
  targetTime: number;
}

export default class extends React.Component<Props, State> {
  base: HTMLDivElement;
  hasVideoLoaded: boolean;
  video: HTMLVideoElement;
  scale: number;
  interval: number;
  hasReachedTarget: boolean;

  constructor(props: Props) {
    super(props);

    this.calculateScale = this.calculateScale.bind(this);

    this.state = {
      targetTime: (props.targetTime || 0) / 1000
    };

    this.hasVideoLoaded = false;
    this.video = document.createElement('video');
    this.video.addEventListener('loadedmetadata', e => {
      this.hasVideoLoaded = true;
    });
    this.video.src = props.src;
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (typeof nextProps.targetTime !== 'undefined') {
      this.setState(() => ({
        targetTime: nextProps.targetTime / 1000
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
        this.base.insertBefore(this.video, this.base.firstElementChild);
        this.video.msRealTime = true;
        this.video.setAttribute('playsinline', 'true');
        this.video.defaultMuted = true;
        this.video.muted = true;
        this.video.style.setProperty('max-width', 'initial');
        this.video.autoplay = false;

        this.props.onVideoLoaded && this.props.onVideoLoaded(this.video);

        // Extra timeout so safari doesn't think we are autoplaying
        setTimeout(() => {
          // NOTE: we don't use ontimeupdate here because we manually play/pause the video
          this.interval = setInterval(() => {
            const timeDifference = Math.abs(this.state.targetTime - this.video.currentTime);
            if (timeDifference === 0) return;

            if (timeDifference < 0.05) {
              if (!this.video.paused) this.video.pause();
              this.video.currentTime = this.state.targetTime;
              if (!this.hasReachedTarget) {
                this.hasReachedTarget = true;
                this.props.onTargetTimeReached && this.props.onTargetTimeReached();
              }
            } else {
              this.hasReachedTarget = false;
              if (this.state.targetTime > this.video.currentTime) {
                if (this.video.paused) {
                  let playing = this.video.play();
                  if (typeof playing.catch === 'function') {
                    playing.catch(err => console.log(err)); // If not muted then you get a DOMException trying to play right away
                  }
                }
              } else {
                this.video.currentTime = this.state.targetTime;
                this.video.pause();
                if (!this.hasReachedTarget) {
                  this.hasReachedTarget = true;
                  this.props.onTargetTimeReached && this.props.onTargetTimeReached();
                }
              }
            }
          }, 50);
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
    return <div ref={el => (this.base = el)}>{this.props.children}</div>;
  }
}
